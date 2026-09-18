/* =========================================================
   Órdago · capa de datos
   ---------------------------------------------------------
   Expone un almacén de documentos muy sencillo:

     DB.doc("grupos/ABC123").set({...})
     DB.doc("grupos/ABC123").get()          -> {exists, data()}
     DB.doc("...").delete()
     DB.collection("grupos/ABC/dias/X/partidas")
       .orderBy("score","desc").limit(60).get()
       .where("codigo","eq","XYZ").limit(1).get()
       .onSnapshot(cb, errCb)

   Detrás hay dos motores:
   · Supabase, si config.js tiene URL y clave -> datos compartidos
   · localStorage, si no -> todo funciona pero solo en tu dispositivo

   Cada documento se guarda como una fila: (coll, id, data jsonb).
   Las colecciones son pequeñas (decenas de filas), así que se traen
   enteras y se ordenan en el navegador. Es más simple y más que
   suficiente para un grupo de amigos.
   ========================================================= */
(function (global) {
  "use strict";

  var CFG = global.DUELO_CONFIG || {};
  var URL_BASE = (CFG.supabaseUrl || "").replace(/\/+$/, "");
  var KEY = CFG.supabaseKey || "";
  var TABLE = CFG.tabla || "documentos";
  var POLL_MS = CFG.refrescoMs || 6000;
  var USA_SUPABASE = !!(URL_BASE && KEY);

  function partir(path) {
    var trozos = String(path).split("/").filter(Boolean);
    var id = trozos.pop();
    return { coll: trozos.join("/"), id: id };
  }

  /* ---------------- motor Supabase ---------------- */
  function rest(ruta, opciones) {
    opciones = opciones || {};
    var cabeceras = {
      "apikey": KEY,
      "Authorization": "Bearer " + KEY,
      "Content-Type": "application/json"
    };
    if (opciones.headers) for (var k in opciones.headers) cabeceras[k] = opciones.headers[k];
    return fetch(URL_BASE + "/rest/v1/" + ruta, {
      method: opciones.method || "GET",
      headers: cabeceras,
      body: opciones.body ? JSON.stringify(opciones.body) : undefined
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error(r.status + " " + t); });
      // Supabase responde 201 sin cuerpo cuando se pide return=minimal,
      // y 204 al borrar. Interpretar un cuerpo vacío como JSON rompería.
      return r.text().then(function (t) {
        if (!t) return null;
        try { return JSON.parse(t); } catch (e) { return null; }
      });
    });
  }

  var supa = {
    leerDoc: function (coll, id) {
      return rest(TABLE + "?coll=eq." + encodeURIComponent(coll) +
                  "&id=eq." + encodeURIComponent(id) + "&select=data")
        .then(function (filas) { return filas && filas.length ? filas[0].data : null; });
    },
    escribirDoc: function (coll, id, data) {
      return rest(TABLE, {
        method: "POST",
        headers: { "Prefer": "resolution=merge-duplicates,return=minimal" },
        body: [{ coll: coll, id: id, data: data, actualizado: new Date().toISOString() }]
      });
    },
    borrarDoc: function (coll, id) {
      return rest(TABLE + "?coll=eq." + encodeURIComponent(coll) +
                  "&id=eq." + encodeURIComponent(id), { method: "DELETE" });
    },
    leerColeccion: function (coll) {
      return rest(TABLE + "?coll=eq." + encodeURIComponent(coll) + "&select=id,data&limit=500")
        .then(function (filas) {
          return (filas || []).map(function (f) { return f.data; });
        });
    }
  };

  /* ---------------- motor local ---------------- */
  var PREFIJO = "duelo:doc:";
  var local = {
    leerDoc: function (coll, id) {
      try {
        var raw = localStorage.getItem(PREFIJO + coll + "/" + id);
        return Promise.resolve(raw ? JSON.parse(raw) : null);
      } catch (e) { return Promise.resolve(null); }
    },
    escribirDoc: function (coll, id, data) {
      try { localStorage.setItem(PREFIJO + coll + "/" + id, JSON.stringify(data)); } catch (e) {}
      return Promise.resolve();
    },
    borrarDoc: function (coll, id) {
      try { localStorage.removeItem(PREFIJO + coll + "/" + id); } catch (e) {}
      return Promise.resolve();
    },
    leerColeccion: function (coll) {
      var out = [];
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k.indexOf(PREFIJO + coll + "/") !== 0) continue;
          if (k.slice((PREFIJO + coll + "/").length).indexOf("/") > -1) continue;
          out.push(JSON.parse(localStorage.getItem(k)));
        }
      } catch (e) {}
      return Promise.resolve(out);
    }
  };

  var motor = USA_SUPABASE ? supa : local;

  /* ---------------- API pública ---------------- */
  function envolver(data) {
    return { exists: data !== null && data !== undefined, data: function () { return data; } };
  }

  function comparar(valor, op, ref) {
    switch (op) {
      case "eq": return valor === ref;
      case "ne": return valor !== ref;
      case "lt": return valor < ref;
      case "lte": return valor <= ref;
      case "gt": return valor > ref;
      case "gte": return valor >= ref;
      case "in": return Array.isArray(ref) && ref.indexOf(valor) > -1;
      default: return true;
    }
  }

  function Consulta(coll) {
    this.coll = coll;
    this.filtros = [];
    this.orden = null;
    this.tope = 0;
    this.timer = null;
  }
  Consulta.prototype.where = function (campo, op, valor) {
    this.filtros.push([campo, op, valor]); return this;
  };
  Consulta.prototype.orderBy = function (campo, dir) {
    this.orden = { campo: campo, dir: dir === "asc" ? 1 : -1 }; return this;
  };
  Consulta.prototype.limit = function (n) { this.tope = n; return this; };
  Consulta.prototype._resolver = function () {
    var self = this;
    return motor.leerColeccion(this.coll).then(function (filas) {
      var out = filas.filter(function (d) {
        return self.filtros.every(function (f) { return comparar(d && d[f[0]], f[1], f[2]); });
      });
      if (self.orden) {
        var c = self.orden.campo, dir = self.orden.dir;
        out.sort(function (a, b) {
          var x = a && a[c], y = b && b[c];
          if (x === y) return 0;
          return (x > y ? 1 : -1) * dir;
        });
      }
      if (self.tope) out = out.slice(0, self.tope);
      return { docs: out.map(function (d) { return { data: function () { return d; } }; }) };
    });
  };
  Consulta.prototype.get = function () { return this._resolver(); };
  Consulta.prototype.onSnapshot = function (cb, errCb) {
    var self = this, ultimo = null, vivo = true;
    function ciclo() {
      if (!vivo) return;
      self._resolver().then(function (snap) {
        var firma = JSON.stringify(snap.docs.map(function (d) { return d.data(); }));
        if (firma !== ultimo) { ultimo = firma; cb(snap); }
      }).catch(function (e) { if (errCb) errCb(e); });
    }
    ciclo();
    this.timer = setInterval(ciclo, POLL_MS);
    // refrescar al volver a la pestaña, para no esperar al siguiente ciclo
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) ciclo();
    });
    return function cancelar() { vivo = false; clearInterval(self.timer); };
  };

  function Documento(path) {
    var p = partir(path);
    this.coll = p.coll; this.id = p.id;
  }
  Documento.prototype.get = function () {
    return motor.leerDoc(this.coll, this.id).then(envolver);
  };
  Documento.prototype.set = function (data) {
    return motor.escribirDoc(this.coll, this.id, data);
  };
  Documento.prototype.update = function (data) {
    var self = this;
    return motor.leerDoc(this.coll, this.id).then(function (prev) {
      var mezcla = prev || {};
      for (var k in data) mezcla[k] = data[k];
      return motor.escribirDoc(self.coll, self.id, mezcla);
    });
  };
  Documento.prototype.delete = function () {
    return motor.borrarDoc(this.coll, this.id);
  };

  var DB = {
    doc: function (path) { return new Documento(path); },
    collection: function (path) { return new Consulta(path); },
    compartido: USA_SUPABASE
  };

  global.DueloDB = DB;
  global.DueloBackend = {
    conectar: function () { return Promise.resolve(DB); },
    compartido: USA_SUPABASE
  };
})(window);
