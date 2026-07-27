/* Client API Apps Script DEV — 2.0.0-dev.4. */
(function (window) {
  "use strict";
  var inflight = false;

  function config() {
    if (!window.PP_V2_CONFIG || window.PP_V2_CONFIG.environment !== "DEV") throw new Error("CONFIG_UNAVAILABLE");
    return window.PP_V2_CONFIG;
  }

  function simulationRequested() {
    return config().simulationEnabled === true &&
      new URLSearchParams(window.location.search).get("simulation") === "1";
  }

  function simulatedResponse(action) {
    var profile = {
      accountType: "ADMINISTRATEUR", role: "DDFPT", displayName: "Profil de démonstration",
      entityId: "demo", entityName: "Établissement fictif",
      permissions: ["PORTAL_VIEW","PROFILE_VIEW","BOOK_VIEW","BOOK_CONTRIBUTE","BOOK_VALIDATE","EQUIPMENT_VIEW","DEROGATION_VIEW","DEROGATION_CREATE","ESTABLISHMENT_SPACE_VIEW","DDFPT_SPACE_VIEW"]
    };
    if (action === "pp_v2_auth_login") {
      var bytes = new Uint8Array(32);
      window.crypto.getRandomValues(bytes);
      return { ok:true, data:{ sessionToken:Array.from(bytes, function (item) { return item.toString(16).padStart(2, "0"); }).join(""), expiresAt:new Date(Date.now() + 600000).toISOString(), profile:profile }, error:null, meta:{environment:"DEV",version:"2.0.0-dev.4",simulation:true} };
    }
    if (action === "pp_v2_auth_session" || action === "pp_v2_profile_get") return { ok:true, data:action === "pp_v2_profile_get" ? profile : { expiresAt:new Date(Date.now() + 600000).toISOString(),profile:profile }, error:null, meta:{environment:"DEV",version:"2.0.0-dev.4",simulation:true} };
    if (action === "pp_v2_auth_logout") return { ok:true,data:{disconnected:true},error:null,meta:{environment:"DEV",version:"2.0.0-dev.4",simulation:true} };
    if (action === "pp_v2_portal_get") {
      var cards = [
        {id:"book",label:"Book des équipements",description:"Consulter le référentiel.",href:"#book"},
        {id:"ddfpt",label:"Espace DDFPT",description:"Coordination et accompagnement.",href:"#ddfpt"},
        {id:"contributions",label:"Contributions",description:"Proposer ou suivre une contribution.",href:"#contributions"},
        {id:"derogations",label:"Dérogations",description:"Préparer et suivre les demandes.",href:"#derogations"},
        {id:"profile",label:"Mon profil",description:"Consulter le profil minimal.",href:"#profil"}
      ];
      return {ok:true,data:{user:{displayName:profile.displayName,role:profile.role,accountType:profile.accountType,entityName:profile.entityName},navigation:cards.map(function(c){return{id:c.id,label:c.label,href:c.href};}),cards:cards,permissions:profile.permissions},error:null,meta:{environment:"DEV",version:"2.0.0-dev.4",simulation:true}};
    }
    return {ok:false,data:null,error:{code:"REQUEST_INVALID",message:"Action simulée indisponible."},meta:{environment:"DEV",version:"2.0.0-dev.4",simulation:true}};
  }

  async function call(action, payload) {
    if (inflight) throw new Error("REQUEST_IN_PROGRESS");
    if (simulationRequested()) return simulatedResponse(action);
    var settings = config();
    if (!settings.appsScriptDevUrl) throw new Error("CONFIG_UNAVAILABLE");
    inflight = true;
    var controller = new AbortController();
    var timer = window.setTimeout(function () { controller.abort(); }, settings.requestTimeoutMs || 12000);
    try {
      var response = await window.fetch(settings.appsScriptDevUrl, {
        method: "POST", headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify(Object.assign({ action: action }, payload || {})),
        signal: controller.signal, cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer"
      });
      if (!response.ok) throw new Error("NETWORK_ERROR");
      var result = await response.json();
      if (!result || typeof result.ok !== "boolean" || !result.meta) throw new Error("INVALID_RESPONSE");
      return result;
    } catch (error) {
      if (error.name === "AbortError") throw new Error("NETWORK_TIMEOUT");
      throw new Error(["NETWORK_ERROR","INVALID_RESPONSE"].indexOf(error.message) !== -1 ? error.message : "NETWORK_ERROR");
    } finally {
      window.clearTimeout(timer);
      inflight = false;
    }
  }

  window.PPApiV2 = Object.freeze({ call: call, isSimulation: simulationRequested });
}(window));
