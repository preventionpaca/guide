/* pp-config.js — PATCH JWT/Supabase + compat rpcFetch
   Objectif:
   - Fournir une auth unique (code -> token) via Supabase Edge Functions
   - Stocker le token dans localStorage (pp_token) + sessionStorage (pp_auth) pour compat
   - Exposer rpcFetch() attendu par certains widgets
   - Ne dépend PAS de Grist (peut tourner dans GitHub Pages / wrapper / iframe)
*/
(function () {
  'use strict';

  // ==== A ADAPTER SI BESOIN (ton projet Supabase) ====
  const SB_PROJECT_URL = 'https://hpiqwvwpxzppxpxhjede.supabase.co';
  const SB_FN = SB_PROJECT_URL.replace(/\/+$/, '') + '/functions/v1';
  const AUTH_ENDPOINT = SB_FN + '/auth-code';     // POST {code:"..."}
  // write-app est appelé par les widgets "base" (pas ici)

  const LS_TOKEN_KEY = 'pp_token';     // utilisé par baseareparer.html
  const SS_AUTH_KEY  = 'pp_auth';      // utilisé par certains tests

  function safeJsonParse(s) { try { return JSON.parse(s); } catch { return null; } }

  function getToken() {
    // priorité: localStorage (persistant), puis sessionStorage
    const t1 = (typeof localStorage !== 'undefined') ? localStorage.getItem(LS_TOKEN_KEY) : null;
    if (t1) return t1;
    const raw = (typeof sessionStorage !== 'undefined') ? sessionStorage.getItem(SS_AUTH_KEY) : null;
    const obj = raw ? safeJsonParse(raw) : null;
    return obj && obj.token ? obj.token : null;
  }

  function setAuth(payload) {
    // payload attendu: {token, role, expiresInSec, ...}
    if (!payload || !payload.token) return;
    try { localStorage.setItem(LS_TOKEN_KEY, payload.token); } catch {}
    try { sessionStorage.setItem(SS_AUTH_KEY, JSON.stringify(payload)); } catch {}
  }

  async function authWithCode(code) {
    const body = JSON.stringify({ code: String(code || '').trim() });
    const res = await fetch(AUTH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });
    let data = null;
    try { data = await res.json(); } catch {}
    if (!res.ok || !data || !data.ok || !data.token) {
      const msg = (data && (data.error || data.message)) ? (data.error || data.message) : ('HTTP ' + res.status);
      throw new Error(msg);
    }
    setAuth(data);
    return data;
  }

  // rpcFetch: wrapper de fetch avec Authorization automatique si token dispo
  async function rpcFetch(url, options) {
    const opt = options ? { ...options } : {};
    opt.headers = opt.headers ? { ...opt.headers } : {};
    const token = getToken();
    if (token && !opt.headers.Authorization && !opt.headers.authorization) {
      opt.headers.Authorization = 'Bearer ' + token;
    }
    return fetch(url, opt);
  }

  // Expose global
  window.PP = window.PP || {};
  window.PP.supabase = { projectUrl: SB_PROJECT_URL, fnBase: SB_FN };
  window.PP.auth = { authWithCode, getToken, setAuth };

  // Compat pour anciens widgets
  window.rpcFetch = rpcFetch;

  // Petit helper debug (facultatif)
  window.PP_DEBUG_AUTH = function () {
    return { token: getToken(), pp_auth: safeJsonParse(sessionStorage.getItem(SS_AUTH_KEY) || 'null') };
  };
})();
