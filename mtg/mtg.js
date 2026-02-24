// MTG (Standard + Commander v1) Launch App
// v0.1.0: Deck library + Scryfall search + match state scaffolding.

const SCRYFALL = {
    search: "https://api.scryfall.com/cards/search",
    card: "https://api.scryfall.com/cards",
    collection: "https://api.scryfall.com/cards/collection",
};

const USER_DECKS_KEY = "mtg.decks.v1";
const GLOBAL_SCRYFALL_CACHE_KEY = "mtg.scryfallCache.v1";
const BASIC_LAND_ID_CACHE_KEY = "mtg.basicLandIds.v1";

function init() {
    sup.makePublic(
        api_boot, api_searchCards, api_getCard, api_getCardsBulk,
        api_listDecks, api_saveDeck, api_deleteDeck, api_validateDeck,
        api_createQuickstartStandardDeck, api_createQuickstartCommanderDeck,
        api_createMatch, api_joinMatch, api_getMatch, api_matchAction
    );
}

function launch() {
    return sup.html(getClientHtml(), {
        width: 1200, height: 800,
        callbacks: [
            "api_boot","api_searchCards","api_getCard","api_getCardsBulk",
            "api_listDecks","api_saveDeck","api_deleteDeck","api_validateDeck",
            "api_createQuickstartStandardDeck","api_createQuickstartCommanderDeck",
            "api_createMatch","api_joinMatch","api_getMatch","api_matchAction",
        ],
    });
}

function getClientHtml() {
    return /* html */ `
<div class="appRoot">
  <style>
    :root {
      --bg: #f6f7f9; --surface: #ffffff; --surface2: #fbfbfc;
      --border: rgba(18,21,26,0.10); --border2: rgba(18,21,26,0.14);
      --text: #12151a; --muted: rgba(18,21,26,0.62); --muted2: rgba(18,21,26,0.44);
      --shadow: 0 10px 30px rgba(0,0,0,0.06); --shadow2: 0 6px 18px rgba(0,0,0,0.08);
      --radius: 16px; --radius2: 12px;
      --ring: 0 0 0 4px rgba(25,118,255,0.16);
      --primary: #0b74ff; --primaryHover: #0a66e0;
      --danger: #ef4444; --dangerHover: #dc2626;
      --success: #16a34a; --warning: #f59e0b;
      --sidebarBg: rgba(255,255,255,0.85); --sidebarBlur: blur(10px);
    }
    .appRoot { width:100%; height:100%; background:var(--bg); color:var(--text); font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji"; overflow:clip; overflow-clip-margin:0; }
    .layout { height:100%; display:grid; grid-template-rows:auto 1fr; }
    .topbar { display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px solid var(--border); background:rgba(255,255,255,0.70); backdrop-filter:blur(10px); }
    .brand { display:flex; gap:12px; align-items:center; min-width:0; }
    .brandMark { width:32px; height:32px; border-radius:10px; background:radial-gradient(circle at 30% 30%,#7dd3fc,#60a5fa 40%,#a78bfa 85%); box-shadow:0 8px 20px rgba(0,0,0,0.12); border:1px solid rgba(0,0,0,0.06); }
    .brandTitle { font-weight:650; font-size:14px; letter-spacing:-0.01em; line-height:1.2; margin:0; }
    .brandSub { font-size:12px; color:var(--muted); margin:2px 0 0 0; line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:720px; }
    .userLabel { font-size:12px; color:var(--muted); padding:6px 10px; border:1px solid var(--border); border-radius:999px; background:rgba(255,255,255,0.7); }
    .body { display:grid; grid-template-columns:270px 1fr; height:100%; min-height:0; }
    .sidebar { border-right:1px solid var(--border); padding:14px; background:var(--sidebarBg); backdrop-filter:var(--sidebarBlur); min-height:0; overflow:auto; }
    .navSectionTitle { font-size:12px; color:var(--muted); font-weight:600; margin:14px 8px 8px 8px; }
    .navBtn { width:100%; display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; border:1px solid transparent; background:transparent; color:var(--text); cursor:pointer; user-select:none; transition:background 120ms ease,border-color 120ms ease,transform 120ms ease; text-align:left; font-size:13px; font-weight:550; }
    .navBtn:hover { background:rgba(18,21,26,0.06); }
    .navBtn.active { background:rgba(11,116,255,0.10); border-color:rgba(11,116,255,0.25); }
    .navDot { width:10px; height:10px; border-radius:999px; background:rgba(18,21,26,0.18); flex:0 0 auto; }
    .navBtn.active .navDot { background:var(--primary); }
    .noteBox { margin-top:14px; padding:12px; border-radius:14px; background:rgba(255,255,255,0.8); border:1px solid var(--border); box-shadow:0 8px 20px rgba(0,0,0,0.04); }
    .noteBox ul { margin:8px 0 0 16px; padding:0; color:var(--muted); font-size:12px; line-height:1.35; }
    .content { padding:16px; min-height:0; overflow:auto; }
    .statusLine { font-size:12px; color:var(--muted); margin:0 0 12px 2px; min-height:16px; }
    .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .sectionTitle { font-size:18px; font-weight:700; letter-spacing:-0.02em; margin:0; }
    .sectionSub { font-size:13px; color:var(--muted); margin-top:4px; }
    .card { border:1px solid var(--border); background:var(--surface); border-radius:var(--radius); box-shadow:var(--shadow); padding:14px; }
    #tab-play .card { position:relative; z-index:5; }
    .cardSubtle { background:rgba(255,255,255,0.75); }
    .row { display:flex; align-items:center; justify-content:space-between; gap:10px; }
    .label { font-size:12px; color:var(--muted); font-weight:600; margin:0 0 6px 2px; }
    .input,.select { width:100%; background:var(--surface); border:1px solid var(--border2); border-radius:12px; padding:10px 12px; font-size:13px; outline:none; transition:box-shadow 120ms ease,border-color 120ms ease,transform 120ms ease; }
    .input:focus,.select:focus { border-color:rgba(11,116,255,0.45); box-shadow:var(--ring); }
    .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius:12px; padding:10px 12px; border:1px solid var(--border2); background:rgba(255,255,255,0.85); color:var(--text); cursor:pointer; font-size:13px; font-weight:650; user-select:none; transition:transform 120ms ease,box-shadow 120ms ease,background 120ms ease,border-color 120ms ease; }
    .btn:hover { background:rgba(255,255,255,1); box-shadow:var(--shadow2); transform:translateY(-1px); }
    .btn:active { transform:translateY(0px); box-shadow:none; }
    .btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; box-shadow:none; }
    .btnPrimary { border-color:rgba(11,116,255,0.35); background:var(--primary); color:white; }
    .btnPrimary:hover { background:var(--primaryHover); border-color:rgba(11,116,255,0.5); }
    .btnDanger { border-color:rgba(239,68,68,0.35); background:var(--danger); color:white; }
    .btnDanger:hover { background:var(--dangerHover); border-color:rgba(239,68,68,0.5); }
    .btnGhost { background:transparent; border-color:transparent; color:var(--muted); font-weight:650; }
    .btnGhost:hover { background:rgba(18,21,26,0.06); color:var(--text); box-shadow:none; transform:none; }
    .pill { display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:999px; border:1px solid var(--border); background:rgba(255,255,255,0.75); color:var(--muted); font-size:12px; font-weight:650; }
    .list { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .deckPanel { padding:12px; }
    .muted { color:var(--muted); font-size:12px; }
    .small { font-size:12px; color:var(--muted); }
    .split { display:grid; grid-template-columns:360px 1fr; gap:14px; min-height:0; }
    .min0 { min-height:0; }
    .stack { display:grid; grid-template-rows:auto 1fr; gap:12px; min-height:0; }
    .cols2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; min-height:0; }
    .scroll { overflow:auto; }
    .resultRow { display:flex; gap:10px; padding:10px; border-radius:14px; border:1px solid var(--border); background:rgba(255,255,255,0.85); transition:transform 120ms ease,box-shadow 120ms ease; }
    .resultRow:hover { transform:translateY(-1px); box-shadow:var(--shadow2); }
    .thumb { width:52px; height:72px; border-radius:12px; border:1px solid var(--border); background:rgba(18,21,26,0.06); object-fit:cover; flex:0 0 auto; }
    .kicker { font-size:12px; color:var(--muted2); font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace; }
    .pre { font-size:12px; background:rgba(255,255,255,0.8); border:1px solid var(--border); border-radius:14px; padding:12px; overflow:auto; max-height:320px; }
    .toasts { position:absolute; top:12px; right:12px; display:flex; flex-direction:column; gap:10px; z-index:50; pointer-events:none; }
    .toast { pointer-events:auto; min-width:240px; max-width:360px; padding:10px 12px; border-radius:14px; border:1px solid var(--border); background:rgba(255,255,255,0.92); box-shadow:var(--shadow2); display:flex; align-items:flex-start; gap:10px; animation:toastIn 160ms ease; }
    @keyframes toastIn { from{transform:translateY(-6px);opacity:0;} to{transform:translateY(0px);opacity:1;} }
    .toastDot { width:10px; height:10px; border-radius:999px; margin-top:4px; background:rgba(18,21,26,0.28); flex:0 0 auto; }
    .toast.info .toastDot { background:var(--primary); }
    .toast.success .toastDot { background:var(--success); }
    .toast.warn .toastDot { background:var(--warning); }
    .toast.error .toastDot { background:var(--danger); }
    .toastMsg { font-size:13px; color:var(--text); font-weight:600; line-height:1.25; }
    .toastSub { margin-top:2px; font-size:12px; color:var(--muted); line-height:1.25; }
    .toastClose { margin-left:auto; border:none; background:transparent; color:var(--muted); cursor:pointer; font-size:14px; padding:2px 6px; border-radius:10px; }
    .toastClose:hover { background:rgba(18,21,26,0.06); color:var(--text); }
    .cardImg { width:64px; height:90px; border-radius:12px; border:1px solid var(--border); object-fit:cover; background:rgba(18,21,26,0.06); cursor:pointer; user-select:none; transition:transform 120ms ease,box-shadow 120ms ease; }
    .cardImg:hover { transform:translateY(-1px); box-shadow:var(--shadow2); }
    .cardImg.selected { box-shadow:0 0 0 3px rgba(11,116,255,0.35),var(--shadow2); border-color:rgba(11,116,255,0.35); }
    .mulliganHand { display:flex; gap:12px; flex-wrap:wrap; justify-content:center; padding:16px 12px; border-radius:14px; background:rgba(18,21,26,0.04); border:1px solid var(--border); margin:12px 0; }
    .mulliganHand .cardImg { width:100px; height:140px; border-radius:12px; flex:0 0 auto; transition:transform 160ms ease,box-shadow 160ms ease; }
    .mulliganHand .cardImg:hover { transform:translateY(-6px) scale(1.04); box-shadow:0 12px 24px rgba(0,0,0,0.15); }
    .zonePills { display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; }
    .zonePill { display:inline-flex; gap:8px; align-items:center; padding:6px 10px; border:1px solid var(--border); background:rgba(255,255,255,0.75); border-radius:999px; font-size:12px; color:var(--muted); font-weight:650; }
    .inspectorImg { width:100%; border-radius:14px; border:1px solid var(--border); background:rgba(18,21,26,0.06); aspect-ratio:63/88; object-fit:cover; }
    .spinner { display:inline-block; width:14px; height:14px; border:2px solid rgba(18,21,26,0.15); border-top-color:var(--primary); border-radius:50%; animation:spin 0.6s linear infinite; vertical-align:middle; margin-right:6px; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .devPanel { display:none; margin:0 0 12px 0; padding:12px; border-radius:var(--radius2); border:1px solid rgba(245,158,11,0.3); background:rgba(245,158,11,0.06); font-size:12px; }
    .devPanel.visible { display:block; }
    .devTitle { font-weight:700; color:var(--warning); margin:0 0 8px 0; }
    .devSection { margin:8px 0 0 0; }
    .devSection .label { color:rgba(245,158,11,0.8); }
    .devPre { font-size:11px; font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace; background:rgba(255,255,255,0.8); border:1px solid rgba(245,158,11,0.2); border-radius:8px; padding:8px; overflow:auto; max-height:200px; white-space:pre-wrap; word-break:break-all; margin:4px 0 0 0; }
    .devToggle { background:transparent; border:1px solid transparent; border-radius:999px; padding:4px 8px; cursor:pointer; font-size:14px; line-height:1; color:var(--muted2); transition:border-color 120ms ease,background 120ms ease; user-select:none; }
    .devToggle:hover { background:rgba(18,21,26,0.06); }
    .devToggle.active { border-color:rgba(245,158,11,0.4); background:rgba(245,158,11,0.08); }
    .cardModalOverlay { position:fixed; inset:0; z-index:100; background:rgba(0,0,0,0.55); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; animation:cardModalIn 160ms ease; }
    @keyframes cardModalIn { from{opacity:0;} to{opacity:1;} }
    .cardModalContent { background:var(--surface); border-radius:var(--radius); box-shadow:0 20px 60px rgba(0,0,0,0.18); max-width:420px; width:90vw; max-height:85vh; overflow:auto; padding:20px; position:relative; }
    .cardModalClose { position:absolute; top:12px; right:12px; width:32px; height:32px; border-radius:999px; border:1px solid var(--border); background:rgba(255,255,255,0.9); color:var(--text); font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 120ms ease,transform 120ms ease; z-index:2; }
    .cardModalClose:hover { background:rgba(255,255,255,1); transform:scale(1.05); }
    .cardModalImg { width:100%; border-radius:var(--radius2); border:1px solid var(--border); aspect-ratio:63/88; object-fit:cover; background:rgba(18,21,26,0.06); }
    .cardModalName { font-size:18px; font-weight:800; letter-spacing:-0.02em; margin:14px 0 0 0; }
    .cardModalMana { font-size:13px; color:var(--muted); font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace; margin:4px 0 0 0; }
    .cardModalType { font-size:13px; color:var(--muted); font-weight:600; margin:8px 0 0 0; }
    .cardModalOracle { font-size:13px; line-height:1.5; margin:12px 0 0 0; padding:12px; border-radius:var(--radius2); border:1px solid var(--border); background:var(--surface2); white-space:pre-wrap; word-break:break-word; }
    .cardModalZone { margin-top:10px; }
    .matchBar { display:none; align-items:center; justify-content:space-between; padding:10px 16px; border-bottom:1px solid var(--border); background:rgba(255,255,255,0.70); backdrop-filter:blur(10px); }
    .matchBarLeft { display:flex; align-items:center; gap:10px; min-width:0; }
    .matchBarTitle { font-weight:700; font-size:14px; letter-spacing:-0.01em; }
    .matchBarSub { font-size:12px; color:var(--muted); }
    .appRoot.matchActive .topbar { display:none; }
    .appRoot.matchActive .sidebar { display:none; }
    .appRoot.matchActive .body { grid-template-columns:1fr; }
    .appRoot.matchActive .matchBar { display:flex; }
    .appRoot.matchActive #devPanel { display:none !important; }
    .appRoot.matchActive #tab-play > .row:first-child { display:none; }
    .appRoot.matchActive #tab-play > .grid2 { display:none; }
    .appRoot.matchActive #tab-play > .card:last-child { display:none; }
    /* Game board - Arena-style vertical split */
    .gameBoard { display:flex; flex-direction:column; height:calc(100vh - 52px); min-height:480px; background:linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%); border-radius:var(--radius); overflow:hidden; position:relative; contain:layout style; }
    .gameBoardInner { display:flex; flex-direction:column; flex:1; min-height:0; }
    .oppSide { flex:1; display:flex; flex-direction:column; padding:12px 16px 8px; min-height:0; gap:4px; }
    .oppSide.multi { flex-direction:row; gap:8px; overflow-x:auto; }
    .oppSide.multi .seatPanel { flex:1; min-width:140px; }
    .oppSide.multi .bfArea { min-height:40px; }
    .oppSide.multi .bfArea .cardImg { width:52px; height:72px; }
    .seatPanel { display:flex; flex-direction:column; flex:1; min-height:0; border-radius:10px; padding:6px 8px; transition:background 200ms ease,border-color 200ms ease; border:2px solid transparent; }
    .seatPanel.active { border-color:rgba(251,191,36,0.5); background:rgba(251,191,36,0.06); }
    .seatBar { display:flex; align-items:center; justify-content:space-between; gap:10px; }
    .seatName { font-weight:800; font-size:14px; color:rgba(255,255,255,0.85); }
    .lifeBadge { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:999px; background:rgba(255,255,255,0.12); color:#fff; font-size:13px; font-weight:700; border:1px solid rgba(255,255,255,0.15); }
    .lifeIcon { font-size:16px; }
    .zoneRow { display:flex; gap:8px; flex-wrap:wrap; margin-top:6px; }
    .zoneBadge { padding:4px 8px; border-radius:8px; background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.6); font-size:11px; font-weight:600; border:1px solid rgba(255,255,255,0.08); }
    .bfArea { flex:1; display:flex; flex-wrap:wrap; gap:8px; align-items:flex-end; justify-content:center; padding:8px 0; min-height:60px; }
    .bfArea .cardImg { width:72px; height:100px; border:1px solid rgba(255,255,255,0.15); border-radius:10px; }
    .bfArea .cardImg:hover { transform:translateY(-4px) scale(1.05); box-shadow:0 8px 20px rgba(0,0,0,0.3); }
    .turnBar { display:flex; align-items:center; justify-content:center; gap:16px; padding:8px 16px; background:rgba(255,255,255,0.06); border-top:1px solid rgba(255,255,255,0.08); border-bottom:1px solid rgba(255,255,255,0.08); flex:0 0 auto; }
    .turnInfo { font-size:13px; color:rgba(255,255,255,0.75); font-weight:600; }
    .turnHighlight { color:#fbbf24; font-weight:800; }
    .turnBar .btn { font-size:12px; padding:6px 14px; background:rgba(255,255,255,0.10); color:#fff; border-color:rgba(255,255,255,0.15); }
    .turnBar .btn:hover { background:rgba(255,255,255,0.18); }
    .turnBar .btnPrimary { background:rgba(11,116,255,0.7); border-color:rgba(11,116,255,0.5); }
    .turnBar .btnPrimary:hover { background:rgba(11,116,255,0.85); }
    .manaBar { display:flex; gap:3px; align-items:center; }
    .manaGem { width:18px; height:18px; border-radius:50%; border:1.5px solid rgba(255,255,255,0.2); transition:all 200ms ease; }
    .manaGem.full { background:radial-gradient(circle at 35% 35%, #c084fc, #7c3aed 60%, #5b21b6); border-color:rgba(124,58,237,0.5); box-shadow:0 0 6px rgba(124,58,237,0.3); }
    .manaGem.empty { background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.1); }
    .manaText { font-size:12px; font-weight:700; color:rgba(255,255,255,0.7); margin-left:4px; }
    .cardImg.unplayable { opacity:0.45; filter:saturate(0.3); }
    .cardImg.unplayable:hover { opacity:0.6; filter:saturate(0.5); }
    .botThinking { display:flex; align-items:center; gap:8px; padding:8px 16px; background:rgba(251,191,36,0.12); border:1px solid rgba(251,191,36,0.25); border-radius:10px; color:rgba(255,255,255,0.85); font-size:13px; font-weight:600; }
    .cardWrap { position:relative; display:inline-block; flex:0 0 auto; }
    .ptBadge { position:absolute; bottom:4px; right:4px; background:rgba(0,0,0,0.82); color:#fff; font-size:10px; font-weight:800; padding:2px 5px; border-radius:5px; line-height:1; pointer-events:none; border:1px solid rgba(255,255,255,0.2); font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace; z-index:2; }
    .ptBadge .ptDamaged { color:#ef4444; }
    .cardWrap.summonSick .cardImg { opacity:0.55; filter:saturate(0.4); }
    .summonSickIcon { position:absolute; top:4px; right:4px; width:18px; height:18px; background:rgba(0,0,0,0.7); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; pointer-events:none; z-index:2; border:1px solid rgba(255,255,255,0.15); }
    .spellOverlay { position:fixed; top:0; left:0; width:100%; height:100%; z-index:100; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5); pointer-events:none; }
    .spellOverlay img { width:240px; height:336px; border-radius:16px; box-shadow:0 0 60px rgba(124,58,237,0.5),0 20px 60px rgba(0,0,0,0.4); animation:spellCast 1.6s ease-out forwards; }
    @keyframes spellCast { 0%{transform:scale(0.3) rotate(-8deg);opacity:0} 15%{transform:scale(1.05) rotate(0deg);opacity:1} 70%{transform:scale(1) rotate(0deg);opacity:1} 100%{transform:scale(0.4) translateY(60vh) rotate(12deg);opacity:0} }
    .cardWrap.tapped .cardImg { transform:rotate(90deg); }
    .cardWrap.tapped { margin:10px 6px; }
    .cardWrap.canAttack { box-shadow:0 0 8px 2px rgba(34,197,94,0.5); border-radius:12px; cursor:pointer; }
    .cardWrap.attacking { transform:translateY(-20px); box-shadow:0 0 10px 3px rgba(239,68,68,0.5); border-radius:12px; }
    .cardWrap.attacking .cardImg { border-color:rgba(239,68,68,0.7); }
    .attackIcon { position:absolute; top:-8px; left:50%; transform:translateX(-50%); width:20px; height:20px; background:rgba(239,68,68,0.85); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; pointer-events:none; z-index:3; border:1px solid rgba(255,255,255,0.3); }
    .cardWrap.canBlock { box-shadow:0 0 8px 2px rgba(34,197,94,0.5); border-radius:12px; cursor:pointer; }
    .cardWrap.blocking { box-shadow:0 0 10px 3px rgba(59,130,246,0.5); border-radius:12px; }
    .cardWrap.blocking .cardImg { border-color:rgba(59,130,246,0.7); }
    .cardWrap.combatIneligible .cardImg { opacity:0.35; filter:saturate(0.2); }
    .phaseBar { display:flex; gap:4px; align-items:center; }
    .phasePill { padding:3px 8px; border-radius:6px; font-size:10px; font-weight:700; text-transform:uppercase; background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.35); border:1px solid rgba(255,255,255,0.06); }
    .phasePill.active { background:rgba(251,191,36,0.18); color:#fbbf24; border-color:rgba(251,191,36,0.35); }
    .dmgFloat { position:absolute; font-size:24px; font-weight:900; color:#ef4444; text-shadow:0 2px 8px rgba(0,0,0,0.5); pointer-events:none; z-index:30; animation:dmgFloatUp 1.2s ease-out forwards; }
    @keyframes dmgFloatUp { 0%{opacity:1;transform:translateY(0) scale(1.2)} 60%{opacity:1;transform:translateY(-30px) scale(1)} 100%{opacity:0;transform:translateY(-50px) scale(0.8)} }
    .combatBanner { display:flex; align-items:center; justify-content:center; gap:8px; padding:6px 14px; background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.25); border-radius:10px; color:rgba(255,255,255,0.9); font-size:13px; font-weight:700; }
    .botThinking .spinner { width:14px; height:14px; border:2px solid rgba(251,191,36,0.3); border-top-color:#fbbf24; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
    .turnOrder { display:flex; gap:4px; align-items:center; }
    .turnDot { width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; color:rgba(255,255,255,0.5); background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.1); transition:all 200ms ease; }
    .turnDot.now { color:#fbbf24; background:rgba(251,191,36,0.18); border-color:rgba(251,191,36,0.4); }
    .turnDot.done { opacity:0.4; }
    .lobbyTurnOrder { display:flex; gap:6px; align-items:center; flex-wrap:wrap; margin-top:8px; padding:8px 10px; border-radius:10px; background:rgba(0,0,0,0.03); border:1px solid var(--border); }
    .lobbyTurnOrder .turnLabel { font-size:11px; font-weight:700; color:var(--muted); margin-right:4px; }
    .lobbyTurnOrder .seatChip { display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:600; background:rgba(0,0,0,0.05); border:1px solid var(--border); }
    .lobbyTurnOrder .seatChip.me { border-color:rgba(11,116,255,0.3); background:rgba(11,116,255,0.08); color:#0a4db3; }
    .mySide { flex:1; display:flex; flex-direction:column; padding:8px 16px 12px; min-height:0; }
    .mySide .bfArea { align-items:flex-start; }
    .handTray { display:flex; gap:10px; overflow-x:auto; padding:10px 8px; justify-content:center; background:rgba(255,255,255,0.06); border-radius:14px; border:1px solid rgba(255,255,255,0.08); margin-top:auto; flex:0 0 auto; }
    .handTray .cardImg { width:90px; height:126px; flex:0 0 auto; border:1px solid rgba(255,255,255,0.18); border-radius:10px; }
    .handTray .cardImg:hover { transform:translateY(-8px) scale(1.06); box-shadow:0 12px 28px rgba(0,0,0,0.35); }
    .handTray .cardImg.selected { box-shadow:0 0 0 3px rgba(251,191,36,0.6),0 8px 20px rgba(0,0,0,0.3); border-color:rgba(251,191,36,0.5); }
    .gameBoard .emptyZone { color:rgba(255,255,255,0.35); font-size:12px; font-style:italic; }
    .inspectFloat { position:absolute; top:12px; right:12px; width:200px; background:rgba(20,20,35,0.92); backdrop-filter:blur(8px); border-radius:var(--radius2); border:1px solid rgba(255,255,255,0.12); padding:10px; z-index:20; display:none; }
    .inspectFloat.visible { display:block; }
    .inspectFloat .inspectorImg { width:100%; border-radius:10px; border:1px solid rgba(255,255,255,0.12); }
    .inspectFloat .inspectorTitle { font-weight:800; font-size:13px; color:#fff; margin-top:8px; }
    .inspectFloat .inspectorSub { font-size:11px; color:rgba(255,255,255,0.55); margin-top:4px; }
    .inspectFloat .btn { width:100%; margin-top:6px; font-size:11px; padding:6px 10px; }
    @media (max-width:980px) {
      .body { grid-template-columns:1fr; }
      .sidebar { border-right:none; border-bottom:1px solid var(--border); }
      .split { grid-template-columns:1fr; }
      .grid2,.list,.cols2 { grid-template-columns:1fr; }
      .cardModalContent { max-width:95vw; max-height:90vh; padding:16px; }
      .cardModalImg { max-height:45vh; width:auto; margin:0 auto; display:block; }
      .appRoot.matchActive .body { grid-template-columns:1fr; }
      .gameBoard { height:auto; min-height:100vh; border-radius:0; }
      .handTray { justify-content:flex-start; }
      .handTray .cardImg { width:72px; height:100px; }
      .inspectFloat { position:fixed; top:auto; bottom:0; right:0; left:0; width:100%; border-radius:16px 16px 0 0; }
      .oppSide.multi { flex-direction:column; gap:4px; }
      .oppSide.multi .seatPanel { min-width:0; }
      .oppSide.multi .bfArea .cardImg { width:48px; height:66px; }
    }
  </style>

  <div id="toasts" class="toasts"></div>
  <div id="cardModal" class="cardModalOverlay" style="display:none;">
    <div class="cardModalContent">
      <button class="cardModalClose" id="cardModalClose" aria-label="Close card inspector">&times;</button>
      <img id="cardModalImg" class="cardModalImg" decoding="async" />
      <div id="cardModalName" class="cardModalName"></div>
      <div id="cardModalMana" class="cardModalMana"></div>
      <div id="cardModalType" class="cardModalType"></div>
      <div id="cardModalOracle" class="cardModalOracle"></div>
      <div id="cardModalZone" class="cardModalZone small"></div>
    </div>
  </div>
  <div class="layout">
    <header class="topbar">
      <div class="brand">
        <div class="brandMark" aria-hidden="true"></div>
        <div class="min0">
          <div class="brandTitle">MTG</div>
          <div class="brandSub">Deck library + Scryfall search + match scaffolding</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <button id="devToggle" class="devToggle" title="Dev panel (triple-click)">&#128027;</button>
        <div class="userLabel" id="userLabel"></div>
      </div>
    </header>
    <div class="matchBar" id="matchBar">
      <div class="matchBarLeft">
        <div class="brandMark" style="width:24px;height:24px;border-radius:8px;" aria-hidden="true"></div>
        <div>
          <div class="matchBarTitle" id="matchBarTitle">Match</div>
          <div class="matchBarSub" id="matchBarSub"></div>
        </div>
      </div>
      <button id="btnLeaveMatch" class="btn" style="font-size:12px;padding:6px 14px;">Leave match</button>
    </div>
    <div class="body">
      <nav class="sidebar">
        <div class="navSectionTitle">MTG</div>
        <button class="navBtn tabBtn active" data-tab="play"><span class="navDot"></span>Play</button>
        <button class="navBtn tabBtn" data-tab="decks"><span class="navDot"></span>Decks</button>
        <button class="navBtn tabBtn" data-tab="builder"><span class="navDot"></span>Deck Builder</button>
        <div class="noteBox">
          <div class="navSectionTitle" style="margin:0 0 6px 0;">Notes</div>
          <ul>
            <li>Decks are saved per-user.</li>
            <li>Standard legality + card data via Scryfall.</li>
            <li>Commander v1: single commander only.</li>
            <li>Rules engine: minimal (mulligans + draw/play debug).</li>
            <li>Standard can be played vs another user OR vs a bot (easy/medium/hard).</li>
          </ul>
        </div>
      </nav>
      <main class="content">
        <div id="status" class="statusLine"></div>
        <div id="devPanel" class="devPanel">
          <div class="devTitle">&#128027; Dev — Sanity Checks</div>
          <div class="devSection">
            <div class="label">Play Config (computed)</div>
            <pre id="devConfig" class="devPre">—</pre>
          </div>
          <div class="devSection">
            <div class="label">Last Create Payload</div>
            <pre id="devPayload" class="devPre">—</pre>
          </div>
          <div class="devSection">
            <div class="label">Last Create Response</div>
            <pre id="devResponse" class="devPre">—</pre>
          </div>
          <div style="margin-top:8px;display:flex;gap:8px;">
            <button id="devCopyConfig" class="btn" style="font-size:11px;padding:6px 10px;">Copy Config JSON</button>
            <button id="devCopyAll" class="btn" style="font-size:11px;padding:6px 10px;">Copy All</button>
          </div>
        </div>

        <section id="tab-play" class="tabPanel">
          <div class="row" style="margin-bottom:12px;">
            <div><div class="sectionTitle">Play</div><div class="sectionSub">Create or join a match.</div></div>
          </div>
          <div class="grid2">
            <div class="card cardSubtle">
              <div style="font-weight:700;">Create match</div>
              <div class="small" style="margin-top:4px;margin-bottom:10px;">Pick a deck that validates for the selected format.</div>
              <div class="label">Format</div>
              <select id="playFormat" class="select" style="margin-bottom:10px;">
                <option value="standard">Standard (1v1)</option>
                <option value="commander">Commander (3-5 players)</option>
              </select>
              <div class="label">Opponent</div>
              <select id="playOpponent" class="select" style="margin-bottom:10px;">
                <option value="human">Another Sup user</option>
                <option value="bot">AI bot</option>
              </select>
              <div id="botOptions" style="display:none;margin-bottom:10px;">
                <div class="label">Bot difficulty</div>
                <select id="playBotDifficulty" class="select">
                  <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                </select>
                <div class="small" style="margin-top:8px;color:var(--muted2);">v1 bot is for testing flow. It can draw/play simple random cards depending on difficulty.</div>
              </div>
              <div class="label">Deck</div>
              <select id="playDeck" class="select"></select>
              <div id="playNoDeckHint" class="small" style="margin-top:8px;display:none;color:var(--muted2);">No decks for this format yet. Go to <b>Deck Builder</b> → <b>Quick start</b>.</div>
              <button id="btnValidateAndCreate" class="btn btnPrimary" style="width:100%;margin-top:10px;">Validate + Create</button>
              <div id="createResult" class="small" style="margin-top:10px;"></div>
            </div>
            <div class="card cardSubtle">
              <div style="font-weight:700;">Join match</div>
              <div class="small" style="margin-top:4px;margin-bottom:10px;">Enter a match ID shared by the host.</div>
              <input id="joinMatchId" class="input" placeholder="matchId" />
              <button id="btnJoin" class="btn btnPrimary" style="width:100%;margin-top:10px;">Join</button>
              <div id="joinResult" class="small" style="margin-top:10px;"></div>
            </div>
          </div>

          <div id="lobbyPanel" class="card" style="margin-top:14px;display:none;">
            <div class="row">
              <div><div style="font-weight:750;">Lobby</div><div id="matchSummary" class="small"></div></div>
              <div class="row" style="justify-content:flex-end;"><button id="btnStartGame" class="btn" style="background:rgba(255,255,255,0.9);">Start game</button></div>
            </div>
            <div style="margin-top:12px;" class="cols2">
              <div class="card" style="box-shadow:none;background:rgba(255,255,255,0.65);">
                <div class="label">Players</div>
                <div id="playerList" style="display:flex;flex-direction:column;gap:10px;"></div>
                <div id="lobbyTurnOrder"></div>
              </div>
              <div class="card" style="box-shadow:none;background:rgba(255,255,255,0.65);">
                <div class="label">You</div>
                <div class="label" style="margin-top:8px;">Assign deck</div>
                <select id="assignDeckSelect" class="select"></select>
                <button id="btnAssignDeck" class="btn" style="width:100%;margin-top:10px;">Assign to my seat</button>
                <button id="btnReady" class="btn btnPrimary" style="width:100%;margin-top:10px;">Ready</button>
                <div id="mulliganPanel" style="margin-top:12px;display:none;">
                  <div style="font-weight:750;margin-bottom:8px;">Mulligan</div>
                  <div style="display:flex;gap:12px;align-items:baseline;flex-wrap:wrap;">
                    <div class="pill" id="handCountPill">Cards in hand: <span class="kicker" id="handCountVal">?</span></div>
                    <div class="pill" id="mulliganCountPill">Mulligans taken: <span class="kicker" id="mulliganCountVal">0</span></div>
                  </div>
                  <div id="mulliganHand" class="mulliganHand"></div>
                  <div class="row" style="justify-content:flex-start;gap:10px;margin-top:10px;">
                    <button id="btnKeep" class="btn btnPrimary" style="flex:1;max-width:160px;">Keep hand</button>
                    <button id="btnMulligan" class="btn" style="flex:1;max-width:160px;">Mulligan</button>
                  </div>
                  <div id="mulliganMsg" class="small" style="margin-top:10px;"></div>
                </div>
                <div id="lobbyMsg" class="small" style="margin-top:10px;"></div>
                <div class="small" style="margin-top:8px;color:var(--muted2);">Start game requires: deck assigned + all players ready.</div>
              </div>
            </div>
          </div>

          <div id="gamePanel" style="margin-top:14px;display:none;">
            <div class="gameBoard" id="gameBoard">
              <div class="gameBoardInner">
                <div class="oppSide" id="oppSide"></div>
                <div class="turnBar" id="turnBar"></div>
                <div class="mySide" id="mySide"></div>
              </div>
              <div class="inspectFloat" id="inspectFloat">
                <img id="inspectorImg" class="inspectorImg" width="180" height="252" decoding="async" />
                <div id="inspectorTitle" class="inspectorTitle"></div>
                <div id="inspectorSub" class="inspectorSub"></div>
                <button id="btnPlaySelected" class="btn btnPrimary">Play to battlefield</button>
                <button id="btnToGraveyard" class="btn">To graveyard</button>
                <button id="btnInspect" class="btn btnGhost">Inspect</button>
              </div>
            </div>
          </div>

          <div class="card" style="margin-top:14px;">
            <div style="font-weight:750;">Current match view <span class="pill">debug</span></div>
            <div class="small" style="margin-top:4px;">This debug view hides opponents' hands/library order.</div>
            <pre id="matchDebug" class="pre" style="margin-top:10px;"></pre>
            <div class="row" style="margin-top:10px;justify-content:flex-start;">
              <button id="btnRefreshMatch" class="btn">Refresh</button>
              <button id="btnDraw" class="btn">Draw (debug)</button>
              <span id="matchActionResult" class="small"></span>
            </div>
          </div>
        </section>

        <section id="tab-decks" class="tabPanel" style="display:none;">
          <div class="row" style="margin-bottom:12px;">
            <div><div class="sectionTitle">Decks</div><div class="sectionSub">Your deck library.</div></div>
            <button id="btnNewDeck" class="btn btnPrimary">New Deck</button>
          </div>
          <div id="deckList" class="list"></div>
        </section>

        <section id="tab-builder" class="tabPanel" style="display:none;">
          <div class="row" style="margin-bottom:12px;">
            <div><div class="sectionTitle">Deck Builder</div><div class="sectionSub">Quick start or customize. Saves as drafts anytime.</div></div>
          </div>
          <div class="split">
            <div class="stack">
              <div class="card">
                <div style="font-weight:800;">Quick start</div>
                <div class="small" style="margin-top:4px;">Create a ready-to-play deck in one click.</div>
                <div style="margin-top:12px;border-top:1px solid var(--border);padding-top:12px;">
                  <div style="font-weight:750;">Standard</div>
                  <div class="small" style="margin-top:4px;">5 mono-color prebuilt decks.</div>
                  <div class="label" style="margin-top:10px;">Prebuilt</div>
                  <select id="qsStandard" class="select">
                    <option value="W">Quickstart — Mono-White Aggro</option>
                    <option value="U">Quickstart — Mono-Blue Tempo</option>
                    <option value="B">Quickstart — Mono-Black Midrange</option>
                    <option value="R" selected>Quickstart — Mono-Red Aggro</option>
                    <option value="G">Quickstart — Mono-Green Stompy</option>
                  </select>
                  <button id="btnCreateQsStandard" class="btn btnPrimary" style="width:100%;margin-top:10px;">Create Standard deck</button>
                  <div id="qsStandardMsg" class="small" style="margin-top:8px;"></div>
                </div>
                <div style="margin-top:12px;border-top:1px solid var(--border);padding-top:12px;">
                  <div style="font-weight:750;">Commander</div>
                  <div class="small" style="margin-top:4px;">Pick a commander and auto-build a 100-card deck around its color identity.</div>
                  <div class="label" style="margin-top:10px;">Popular commanders</div>
                  <select id="qsPopularCommander" class="select"></select>
                  <button id="btnCreateQsCommanderPopular" class="btn btnPrimary" style="width:100%;margin-top:10px;">Create Commander deck</button>
                  <div class="label" style="margin-top:12px;">Or search a commander (Legendary Creature)</div>
                  <div class="row" style="justify-content:flex-start;">
                    <input id="qsCommanderSearch" class="input" style="flex:1;" placeholder="e.g. atraxa, miirym, krenko" />
                    <button id="btnQsCommanderSearch" class="btn">Search</button>
                  </div>
                  <div id="qsCommanderChosen" class="small" style="margin-top:8px;"></div>
                  <div id="qsCommanderResults" style="display:flex;flex-direction:column;gap:10px;margin-top:10px;"></div>
                  <button id="btnCreateQsCommanderChosen" class="btn btnPrimary" style="width:100%;margin-top:10px;" disabled>Create deck from chosen commander</button>
                  <div id="qsCommanderMsg" class="small" style="margin-top:8px;"></div>
                </div>
              </div>
              <div class="card">
                <div style="font-weight:750;">Deck</div>
                <div class="small" style="margin-top:4px;">Select a deck to edit</div>
                <select id="builderDeck" class="select" style="margin-top:10px;"></select>
                <div style="margin-top:12px;" class="grid2">
                  <div><div class="label">Name</div><input id="deckName" class="input" /></div>
                  <div><div class="label">Format</div><select id="deckFormat" class="select"><option value="standard">Standard</option><option value="commander">Commander</option></select></div>
                </div>
                <div id="commanderPanel" style="margin-top:12px;display:none;">
                  <div class="label">Commander (v1 single commander)</div>
                  <div class="row" style="justify-content:space-between;">
                    <div class="kicker" id="commanderLabel">None selected</div>
                    <button id="btnClearCommander" class="btn btnGhost">Clear</button>
                  </div>
                  <div class="small" style="margin-top:6px;color:var(--muted2);">Commander must be included in the 100 cards exactly once.</div>
                </div>
                <div style="margin-top:12px;border-top:1px solid var(--border);padding-top:12px;">
                  <div class="row"><div style="font-weight:750;">Card Count</div><div id="countLabel" class="kicker">0</div></div>
                  <div id="countHint" class="small" style="margin-top:6px;"></div>
                </div>
                <div class="row" style="margin-top:12px;">
                  <button id="btnSaveDeck" class="btn btnPrimary" style="flex:1;">Save</button>
                  <button id="btnDeleteDeck" class="btn btnDanger">Delete</button>
                </div>
                <div id="saveResult" class="small" style="margin-top:10px;"></div>
              </div>
            </div>
            <div class="stack">
              <div class="card">
                <div style="font-weight:750;">Search cards (Scryfall)</div>
                <div class="row" style="margin-top:10px;justify-content:flex-start;">
                  <input id="searchQuery" class="input" style="flex:1;" placeholder="e.g. lightning bolt, type:creature cmc<=2 format:standard" />
                  <button id="btnSearch" class="btn btnPrimary">Search</button>
                </div>
                <div class="small" style="margin-top:10px;">Tip: Use Scryfall syntax. We enforce legality + Commander rules at validation time.</div>
              </div>
              <div class="cols2">
                <div class="card scroll" style="padding:12px;">
                  <div style="font-weight:750;margin-bottom:10px;">Results</div>
                  <div id="results" style="display:flex;flex-direction:column;gap:10px;"></div>
                </div>
                <div class="card scroll" style="padding:12px;">
                  <div style="font-weight:750;margin-bottom:10px;">Deck list</div>
                  <div id="deckCards" style="display:flex;flex-direction:column;gap:10px;"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</div>

<script>
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const popularCommanders = [
    "Atraxa, Praetors' Voice",
    'Edgar Markov',
    'The Ur-Dragon',
    'Miirym, Sentinel Wyrm',
    'Krenko, Mob Boss',
    'Korvold, Fae-Cursed King',
    'Lathril, Blade of the Elves',
    "Yuriko, the Tiger's Shadow",
    'Muldrotha, the Gravetide',
    'Isshin, Two Heavens as One'
  ];

  const state = {
    user: null, decks: [], activeTab: 'play', activeDeckId: null, activeDeck: null,
    activeMatchId: null, lastMatch: null, lastSearchResults: [], booting: false, booted: false,
    cardIndex: {}, selected: { id: null, zone: null, seat: null }, qsCommanderChosen: null,
    combatMode: null, pendingAttackers: {}, pendingBlockers: {}, selectedBlocker: null,
  };

  function toast(msg, opts) {
    const options = opts || {};
    const type = options.type || 'info';
    const title = options.title || '';
    const ms = Number.isFinite(options.ms) ? options.ms : 2600;
    const host = $('#toasts');
    if (!host) return;
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    const close = document.createElement('button');
    close.className = 'toastClose';
    close.textContent = '\u00d7';
    const dot = document.createElement('div');
    dot.className = 'toastDot';
    const body = document.createElement('div');
    const m = document.createElement('div');
    m.className = 'toastMsg';
    m.textContent = title ? title : msg;
    body.appendChild(m);
    if (title) {
      const sub = document.createElement('div');
      sub.className = 'toastSub';
      sub.textContent = msg;
      body.appendChild(sub);
    }
    el.appendChild(dot);
    el.appendChild(body);
    el.appendChild(close);
    close.onclick = () => el.remove();
    host.appendChild(el);
    if (ms > 0) { setTimeout(() => { if (el.isConnected) el.remove(); }, ms); }
  }

  function setStatus(msg) { $('#status').textContent = msg || ''; }

  function switchTab(tab) {
    state.activeTab = tab;
    $$('.tabPanel').forEach(el => { el.style.display = 'none'; });
    $('#tab-' + tab).style.display = '';
    $$('.tabBtn').forEach(btn => { btn.classList.toggle('active', btn.dataset.tab === tab); });
  }

  function enterMatchMode() {
    document.querySelector('.appRoot').classList.add('matchActive');
    switchTab('play');
    updateMatchBar();
  }

  function exitMatchMode() {
    document.querySelector('.appRoot').classList.remove('matchActive');
    state.activeMatchId = null;
    state.lastMatch = null;
    renderLobby(null);
    $('#gamePanel').style.display = 'none';
    $('#createResult').textContent = '';
    $('#joinResult').textContent = '';
  }

  function updateMatchBar() {
    const m = state.lastMatch;
    if (!m) { $('#matchBarTitle').textContent = 'Match'; $('#matchBarSub').textContent = ''; return; }
    const fmt = (m.format || 'standard').charAt(0).toUpperCase() + (m.format || 'standard').slice(1);
    const phase = (m.phase || 'lobby').charAt(0).toUpperCase() + (m.phase || 'lobby').slice(1);
    $('#matchBarTitle').textContent = fmt + ' Match';
    $('#matchBarSub').textContent = m.matchId + ' \\u2022 ' + phase;
  }

  function fmtUpdated(deck) {
    const d = new Date(deck.updatedAt || deck.createdAt || Date.now());
    return d.toLocaleString();
  }

  function totalCount(deck) {
    if (!deck?.cards) return 0;
    return Object.values(deck.cards).reduce((a,b) => a + (Number(b)||0), 0);
  }

  function countHint(deck) {
    const n = totalCount(deck);
    if (!deck) return '';
    if (deck.format === 'standard') {
      if (n < 60) return \`Need at least 60 cards to play Standard (\${60 - n} more). Drafts can be saved anytime.\`;
      return \`Standard deck size OK (>= 60). Validation will also check card legality.\`;
    }
    if (deck.format === 'commander') {
      if (n < 100) return \`Need exactly 100 cards to play Commander (\${100 - n} more). Drafts can be saved anytime.\`;
      if (n > 100) return \`Need exactly 100 cards to play Commander (remove \${n - 100}).\`;
      if (!deck.commander) return \`Commander deck needs a Commander selected.\`;
      const cmdCount = Number(deck.cards?.[deck.commander] || 0);
      if (cmdCount !== 1) return \`Commander must be included in the 100 cards exactly once (currently \${cmdCount}).\`;
      return \`Commander deck size OK (100). Validation will also check singleton + color identity + legality.\`;
    }
    return '';
  }

  function escapeHtml(s) {
    return String(s || '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  }

  function updateDeckBuilderUI() {
    const deck = state.activeDeck;
    if (!deck) return;
    $('#deckName').value = deck.name || '';
    $('#deckFormat').value = deck.format || 'standard';
    const isCommander = deck.format === 'commander';
    $('#commanderPanel').style.display = isCommander ? '' : 'none';
    $('#commanderLabel').textContent = deck.commanderName ? deck.commanderName : 'None selected';
    $('#countLabel').textContent = String(totalCount(deck));
    $('#countHint').textContent = countHint(deck);
    renderDeckCards(deck);
  }

  function renderDeckCards(deck) {
    const container = $('#deckCards');
    container.innerHTML = '';
    const entries = Object.entries(deck.cards || {}).filter(([,c]) => (Number(c)||0) > 0);
    entries.sort((a,b) => (a[1] - b[1]) || (a[0] > b[0] ? 1 : -1));
    if (entries.length === 0) {
      container.innerHTML = \`<div class="small">No cards yet. Search and add cards.</div>\`;
      return;
    }
    for (const [cardId, count] of entries) {
      const meta = (deck.cardMeta && deck.cardMeta[cardId]) || {};
      const row = document.createElement('div');
      row.className = 'resultRow';
      const isCommander = deck.format === 'commander' && deck.commander === cardId;
      row.innerHTML = \`
        <div style="min-width:0; flex: 1;">
          <div style="font-size:13px;font-weight:750;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            \${escapeHtml(meta.name || cardId)}\${isCommander ? ' <span class="pill" style="border-color:rgba(245,158,11,0.3);color:#9a5a00;background:rgba(245,158,11,0.10);">Commander</span>' : ''}
          </div>
          <div class="small" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${escapeHtml(meta.typeLine || '')}</div>
        </div>
        <div class="row" style="justify-content:flex-end;gap:8px;">
          <button class="btn" style="padding:8px 10px;" title="Remove">-</button>
          <div class="kicker" style="width:28px;text-align:center;">\${Number(count)}</div>
          <button class="btn" style="padding:8px 10px;" title="Add">+</button>
        </div>
      \`;
      const btns = row.querySelectorAll('button');
      btns[0].onclick = () => changeCount(cardId, -1);
      btns[1].onclick = () => changeCount(cardId, +1);
      container.appendChild(row);
    }
  }

  function renderResults(results) {
    const container = $('#results');
    container.innerHTML = '';
    if (!results || results.length === 0) {
      container.innerHTML = \`<div class="small">No results.</div>\`;
      return;
    }
    for (const card of results) {
      const row = document.createElement('div');
      row.className = 'resultRow';
      const img = card.imageSmall ? \`<img src="\${card.imageSmall}" class="thumb" />\` : \`<div class="thumb"></div>\`;
      row.innerHTML = \`
        \${img}
        <div style="min-width:0; flex: 1;">
          <div style="font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${escapeHtml(card.name)}</div>
          <div class="small" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${escapeHtml(card.typeLine || '')}</div>
          <div class="kicker" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:3px;">\${escapeHtml(card.manaCost || '')}</div>
          <div class="row" style="margin-top:8px;justify-content:flex-start;">
            <button class="btn btnPrimary" style="padding:8px 10px;">Add</button>
            <button class="btn" style="padding:8px 10px;">Set as Commander</button>
          </div>
        </div>
      \`;
      const addBtn = row.querySelectorAll('button')[0];
      const cmdBtn = row.querySelectorAll('button')[1];
      addBtn.onclick = () => addCard(card);
      cmdBtn.onclick = () => setCommander(card);
      container.appendChild(row);
    }
  }

  function renderCommanderSearchResults(results) {
    const host = $('#qsCommanderResults');
    host.innerHTML = '';
    if (!results || !results.length) { host.innerHTML = '<div class="small">No results.</div>'; return; }
    for (const card of results) {
      const row = document.createElement('div');
      row.className = 'resultRow';
      const img = card.imageSmall ? \`<img src="\${card.imageSmall}" class="thumb" />\` : \`<div class="thumb"></div>\`;
      row.innerHTML = \`
        \${img}
        <div style="min-width:0; flex: 1;">
          <div style="font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${escapeHtml(card.name)}</div>
          <div class="small" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${escapeHtml(card.typeLine || '')}</div>
          <div class="row" style="margin-top:8px;justify-content:flex-start;">
            <button class="btn btnPrimary" style="padding:8px 10px;">Choose</button>
          </div>
        </div>
      \`;
      row.querySelector('button').onclick = () => {
        state.qsCommanderChosen = card;
        $('#qsCommanderChosen').textContent = 'Chosen: ' + card.name;
        $('#btnCreateQsCommanderChosen').disabled = false;
        toast('Commander selected.', { type: 'success' });
      };
      host.appendChild(row);
    }
  }

  function setActiveDeck(deckId) {
    state.activeDeckId = deckId;
    state.activeDeck = state.decks.find(d => d.id === deckId) || null;
    updateDeckBuilderUI();
  }

  function upsertDeckLocal(deck) {
    const idx = state.decks.findIndex(d => d.id === deck.id);
    if (idx >= 0) state.decks[idx] = deck;
    else state.decks.unshift(deck);
  }

  function isContextRetryableError(err) {
    const msg = String(err?.message || err || '').toLowerCase();
    const needles = ['context not available','ensure iframe is set up with context','iframe is set up with context','iframe','sup context'];
    return needles.some((n) => msg.includes(n));
  }

  async function supExec(name, value, opts) {
    const options = opts || {};
    let delayMs = Number.isFinite(options.delayMs) ? options.delayMs : 250;
    const maxDelayMs = Number.isFinite(options.maxDelayMs) ? options.maxDelayMs : 1500;
    const maxWaitMs = Number.isFinite(options.maxWaitMs) ? options.maxWaitMs : null;
    const start = Date.now();
    let lastErr;
    while (true) {
      const waited = Date.now() - start;
      if (maxWaitMs != null && waited > maxWaitMs) throw lastErr || new Error('Sup exec timed out');
      if (waited > 1200 && waited % 1000 < 60) setStatus('Waiting for Sup context\u2026 (Preview sometimes requires Refresh or "Share with chat")');
      try {
        if (!window.sup || typeof window.sup.exec !== 'function') { await sleep(delayMs); delayMs = Math.min(maxDelayMs, Math.floor(delayMs * 1.2)); continue; }
        if (typeof value === 'undefined') return await window.sup.exec(name);
        return await window.sup.exec(name, value);
      } catch (err) {
        lastErr = err;
        if (isContextRetryableError(err)) { await sleep(delayMs); delayMs = Math.min(maxDelayMs, Math.floor(delayMs * 1.2)); continue; }
        throw err;
      }
    }
  }

  function updateOpponentUI() {
    const fmt = $('#playFormat').value;
    const opp = $('#playOpponent').value;
    if (fmt !== 'standard') {
      $('#playOpponent').value = 'human';
      $('#playOpponent').disabled = true;
      $('#botOptions').style.display = 'none';
      if (typeof updateDevPanel === 'function') updateDevPanel();
      return;
    }
    $('#playOpponent').disabled = false;
    const showBot = opp === 'bot';
    $('#botOptions').style.display = showBot ? '' : 'none';
    if (showBot && !$('#playBotDifficulty').value) $('#playBotDifficulty').value = 'easy';
    if (typeof updateDevPanel === 'function') updateDevPanel();
  }

  function getPlayConfig() {
    const format = $('#playFormat').value || 'standard';
    const opponentRaw = $('#playOpponent').value || 'human';
    const opponentType = format !== 'standard' ? 'human' : opponentRaw;
    const botDifficulty = opponentType === 'bot' ? ($('#playBotDifficulty').value || 'easy') : null;
    const deckId = $('#playDeck').value || null;
    const deckName = deckId ? ($('#playDeck').selectedOptions[0]?.textContent || null) : null;
    return { format, opponentType, botDifficulty, deckId, deckName };
  }

  const _devState = { clicks: 0, clickTimer: null, active: false, lastPayload: null, lastResponse: null, lastValidate: null };

  function initDevPanel() {
    try {
      const saved = sessionStorage.getItem('mtg.devPanel');
      if (saved === 'active') { _devState.active = true; $('#devPanel').classList.add('visible'); $('#devToggle').classList.add('active'); updateDevPanel(); }
    } catch(e) { /* sessionStorage may be unavailable */ }
  }

  function toggleDevPanel() {
    _devState.clicks++;
    clearTimeout(_devState.clickTimer);
    _devState.clickTimer = setTimeout(() => { _devState.clicks = 0; }, 500);
    if (_devState.clicks < 3) return;
    _devState.clicks = 0;
    _devState.active = !_devState.active;
    $('#devPanel').classList.toggle('visible', _devState.active);
    $('#devToggle').classList.toggle('active', _devState.active);
    try { sessionStorage.setItem('mtg.devPanel', _devState.active ? 'active' : ''); } catch(e) {}
    if (_devState.active) updateDevPanel();
  }

  function updateDevPanel() {
    if (!_devState.active) return;
    try {
      const config = getPlayConfig();
      $('#devConfig').textContent = JSON.stringify(config, null, 2);
    } catch(e) { $('#devConfig').textContent = 'Error: ' + e.message; }
    if (_devState.lastPayload) $('#devPayload').textContent = JSON.stringify(_devState.lastPayload, null, 2);
    if (_devState.lastResponse) $('#devResponse').textContent = JSON.stringify(_devState.lastResponse, null, 2);
  }

  function devLog(key, data) {
    if (key === 'createPayload' || key === 'playConfig') _devState.lastPayload = data;
    else if (key === 'createResult') _devState.lastResponse = data;
    else if (key === 'validateResult') _devState.lastValidate = data;
    updateDevPanel();
  }

  async function loadDecks() {
    setStatus('Loading decks\u2026');
    const decks = await supExec('api_listDecks');
    state.decks = decks || [];
    renderDeckSelectors();
    renderDeckList();
    if (!state.activeDeckId && state.decks.length) setActiveDeck(state.decks[0].id);
    setStatus('');
  }

  function renderDeckSelectors() {
    const builderSel = $('#builderDeck');
    builderSel.innerHTML = '';
    for (const deck of state.decks) {
      const opt = document.createElement('option');
      opt.value = deck.id;
      opt.textContent = \`\${deck.name || 'Untitled'} \u2014 \${deck.format}\`;
      builderSel.appendChild(opt);
    }
    builderSel.value = state.activeDeckId || (state.decks[0]?.id || '');
    const playSel = $('#playDeck');
    playSel.innerHTML = '';
    const format = $('#playFormat').value;
    const playableDecks = state.decks.filter(d => d.format === format);
    for (const deck of playableDecks) {
      const opt = document.createElement('option');
      opt.value = deck.id;
      opt.textContent = \`\${deck.name || 'Untitled'} (\${totalCount(deck)} cards)\`;
      playSel.appendChild(opt);
    }
    $('#playNoDeckHint').style.display = playableDecks.length ? 'none' : '';
    if (!playableDecks.length) { const opt = document.createElement('option'); opt.value = ''; opt.textContent = 'No decks available'; playSel.appendChild(opt); }
    updateOpponentUI();
    if (builderSel.value) setActiveDeck(builderSel.value);
    const popSel = $('#qsPopularCommander');
    if (popSel && !popSel.dataset.bound) {
      popSel.dataset.bound = '1';
      popSel.innerHTML = '';
      for (const name of popularCommanders) { const opt = document.createElement('option'); opt.value = name; opt.textContent = name; popSel.appendChild(opt); }
    }
  }

  function renderDeckList() {
    const container = $('#deckList');
    container.innerHTML = '';
    if (!state.decks.length) { container.innerHTML = \`<div class="small">No decks yet. Use <b>Deck Builder</b> \u2192 <b>Quick start</b> to create one fast.</div>\`; return; }
    for (const deck of state.decks) {
      const cardCount = totalCount(deck);
      const panel = document.createElement('div');
      panel.className = 'card deckPanel';
      panel.innerHTML = \`
        <div class="row" style="align-items:flex-start;">
          <div style="min-width:0;">
            <div style="font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${escapeHtml(deck.name || 'Untitled')}</div>
            <div class="small">\${deck.format} \u2022 \${cardCount} cards \u2022 updated \${escapeHtml(fmtUpdated(deck))}</div>
          </div>
          <button class="btn">Edit</button>
        </div>
        \${deck.format === 'commander' ? \`<div class="small" style="margin-top:10px;">Commander: <span class="kicker">\${escapeHtml(deck.commanderName || 'None')}</span></div>\` : ''}
        <div class="small" style="margin-top:10px;">\${escapeHtml(countHint(deck))}</div>
      \`;
      panel.querySelector('button').onclick = () => { setActiveDeck(deck.id); $('#builderDeck').value = deck.id; switchTab('builder'); };
      container.appendChild(panel);
    }
  }

  async function newDeck() {
    const draft = { name: 'Untitled', format: 'standard', cards: {}, commander: null, commanderName: null };
    const saved = await supExec('api_saveDeck', { deck: draft });
    upsertDeckLocal(saved); renderDeckSelectors(); renderDeckList();
    setActiveDeck(saved.id); $('#builderDeck').value = saved.id; switchTab('builder');
    toast('Created a new deck.', { type: 'success' });
  }

  function ensureActiveDeck() {
    if (!state.activeDeck) throw new Error('No active deck');
    if (!state.activeDeck.cards) state.activeDeck.cards = {};
    if (!state.activeDeck.cardMeta) state.activeDeck.cardMeta = {};
  }

  function addCard(card) {
    ensureActiveDeck();
    const id = card.id;
    const cur = Number(state.activeDeck.cards[id] || 0);
    state.activeDeck.cards[id] = cur + 1;
    state.activeDeck.cardMeta[id] = { name: card.name, typeLine: card.typeLine, cmc: Number(card.cmc) || 0, power: card.power || null, toughness: card.toughness || null };
    updateDeckBuilderUI();
  }

  function changeCount(cardId, delta) {
    ensureActiveDeck();
    const cur = Number(state.activeDeck.cards[cardId] || 0);
    const next = Math.max(0, cur + delta);
    if (next === 0) delete state.activeDeck.cards[cardId];
    else state.activeDeck.cards[cardId] = next;
    if (state.activeDeck.format === 'commander' && state.activeDeck.commander === cardId && !state.activeDeck.cards[cardId]) {
      state.activeDeck.commander = null; state.activeDeck.commanderName = null;
    }
    updateDeckBuilderUI();
  }

  function setCommander(card) {
    ensureActiveDeck();
    if (state.activeDeck.format !== 'commander') {
      state.activeDeck.format = 'commander'; $('#deckFormat').value = 'commander';
      $('#saveResult').textContent = 'Switched deck format to Commander.';
      toast('Switched this deck to Commander.', { type: 'info' }); renderDeckSelectors();
    }
    state.activeDeck.commander = card.id; state.activeDeck.commanderName = card.name;
    state.activeDeck.cards[card.id] = 1;
    state.activeDeck.cardMeta[card.id] = { name: card.name, typeLine: card.typeLine, cmc: Number(card.cmc) || 0, power: card.power || null, toughness: card.toughness || null };
    updateDeckBuilderUI();
  }

  async function saveActiveDeck() {
    ensureActiveDeck();
    const deck = state.activeDeck;
    deck.name = $('#deckName').value || 'Untitled';
    deck.format = $('#deckFormat').value;
    if (deck.format !== 'commander') { deck.commander = null; deck.commanderName = null; }
    $('#saveResult').textContent = 'Saving\u2026';
    const saved = await supExec('api_saveDeck', { deck });
    upsertDeckLocal(saved); setActiveDeck(saved.id); renderDeckSelectors(); renderDeckList();
    $('#saveResult').textContent = 'Saved.'; toast('Deck saved.', { type: 'success' });
  }

  async function deleteActiveDeck() {
    if (!state.activeDeckId) return;
    const ok = confirm('Delete this deck?');
    if (!ok) return;
    await supExec('api_deleteDeck', { deckId: state.activeDeckId });
    state.decks = state.decks.filter(d => d.id !== state.activeDeckId);
    state.activeDeckId = state.decks[0]?.id || null; state.activeDeck = state.decks[0] || null;
    renderDeckSelectors(); renderDeckList(); updateDeckBuilderUI();
    toast('Deck deleted.', { type: 'success' });
  }

  async function search() {
    const q = $('#searchQuery').value;
    if (!q.trim()) return;
    setStatus('Searching\u2026');
    const format = $('#deckFormat').value || 'standard';
    const results = await supExec('api_searchCards', { query: q, limit: 20, formatHint: format });
    state.lastSearchResults = results || [];
    renderResults(state.lastSearchResults); setStatus('');
  }

  async function createQuickstartStandard() {
    const color = $('#qsStandard').value;
    const btn = $('#btnCreateQsStandard');
    btn.disabled = true;
    $('#qsStandardMsg').innerHTML = '<span class="spinner"></span>Building Standard deck\u2026';
    try {
      const deck = await supExec('api_createQuickstartStandardDeck', { color });
      await loadDecks();
      if (deck?.id) { setActiveDeck(deck.id); $('#builderDeck').value = deck.id; }
      $('#qsStandardMsg').textContent = 'Created.';
      toast('Quickstart deck created.', { type: 'success' }); switchTab('play'); renderDeckSelectors();
    } catch (err) {
      const msg = String(err?.message || err || '');
      $('#qsStandardMsg').textContent = 'Failed: ' + msg;
      toast(msg, { type: 'error', title: 'Quickstart failed' });
    } finally {
      btn.disabled = false;
    }
  }

  async function createQuickstartCommanderFromPopular() {
    const name = $('#qsPopularCommander').value;
    if (!name) return;
    const btn = $('#btnCreateQsCommanderPopular');
    btn.disabled = true;
    $('#qsCommanderMsg').innerHTML = '<span class="spinner"></span>Building Commander deck \u2014 fetching cards from Scryfall\u2026';
    try {
      const deck = await supExec('api_createQuickstartCommanderDeck', { commanderName: name });
      await loadDecks();
      if (deck?.id) { setActiveDeck(deck.id); $('#builderDeck').value = deck.id; }
      $('#qsCommanderMsg').textContent = 'Created.';
      toast('Commander quickstart deck created.', { type: 'success' }); switchTab('play'); renderDeckSelectors();
    } catch (err) {
      const msg = String(err?.message || err || '');
      $('#qsCommanderMsg').textContent = 'Failed: ' + msg;
      toast(msg, { type: 'error', title: 'Quickstart failed' });
    } finally {
      btn.disabled = false;
    }
  }

  async function quickstartCommanderSearch() {
    const q = ($('#qsCommanderSearch').value || '').trim();
    if (!q) return;
    $('#qsCommanderMsg').textContent = ''; $('#qsCommanderChosen').textContent = '';
    $('#btnCreateQsCommanderChosen').disabled = true; state.qsCommanderChosen = null;
    setStatus('Searching commanders\u2026');
    try {
      const query = q.includes('t:') ? q : \`\${q} t:legendary t:creature\`;
      const results = await supExec('api_searchCards', { query, limit: 12, formatHint: 'commander' });
      renderCommanderSearchResults(results || []); setStatus('');
    } catch (err) { setStatus(''); toast(String(err?.message || err || ''), { type: 'error', title: 'Search failed' }); }
  }

  async function createQuickstartCommanderFromChosen() {
    const card = state.qsCommanderChosen;
    if (!card?.id) return;
    const btn = $('#btnCreateQsCommanderChosen');
    btn.disabled = true;
    $('#qsCommanderMsg').innerHTML = '<span class="spinner"></span>Building Commander deck \u2014 fetching cards from Scryfall\u2026';
    try {
      const deck = await supExec('api_createQuickstartCommanderDeck', { commanderId: card.id });
      await loadDecks();
      if (deck?.id) { setActiveDeck(deck.id); $('#builderDeck').value = deck.id; }
      $('#qsCommanderMsg').textContent = 'Created.';
      toast('Commander quickstart deck created.', { type: 'success' }); switchTab('play'); renderDeckSelectors();
    } catch (err) {
      const msg = String(err?.message || err || '');
      $('#qsCommanderMsg').textContent = 'Failed: ' + msg;
      toast(msg, { type: 'error', title: 'Quickstart failed' });
    } finally {
      btn.disabled = false;
    }
  }

  async function validateAndCreateMatch() {
    const config = getPlayConfig();
    devLog('playConfig', config);
    if (!config.deckId) { $('#createResult').textContent = 'No deck selected.'; toast('No deck selected.', { type: 'warn' }); return; }
    if (config.opponentType === 'bot' && config.format !== 'standard') { $('#createResult').textContent = 'Bot is only supported for Standard (v1).'; toast('Bot is only supported for Standard (v1).', { type: 'warn' }); return; }
    if (config.opponentType === 'bot' && !config.botDifficulty) { $('#createResult').textContent = 'Bot difficulty not set.'; toast('Bot difficulty not set.', { type: 'warn' }); return; }
    $('#createResult').textContent = 'Validating\u2026';
    const v = await supExec('api_validateDeck', { deckId: config.deckId });
    devLog('validateResult', v);
    if (!v.ok) { $('#createResult').textContent = 'Invalid deck: ' + v.errors.join(' | '); toast('Deck validation failed.', { type: 'error', title: 'Invalid deck' }); return; }
    $('#createResult').textContent = 'Creating match\u2026';
    const opponent = config.opponentType === 'bot' ? { type: 'bot', difficulty: config.botDifficulty } : { type: 'human' };
    const payload = { format: config.format, hostDeckId: config.deckId, opponent };
    devLog('createPayload', payload);
    const res = await supExec('api_createMatch', payload);
    devLog('createResult', res);
    if (!res?.ok) {
      const err = res?.error || 'unknown error';
      const errors = Array.isArray(res?.errors) ? res.errors : [];
      $('#createResult').textContent = 'Create failed: ' + err + (errors.length ? (' \u2014 ' + errors.join(' | ')) : '');
      toast('Create failed: ' + err, { type: 'error' }); return;
    }
    state.activeMatchId = res.matchId;
    $('#createResult').textContent = \`Match created. Share this matchId: \${res.matchId}\`;
    toast('Match created. Copy the matchId from the panel.', { type: 'success' });
    await refreshMatch();
    enterMatchMode();
  }

  async function joinMatch() {
    const matchId = $('#joinMatchId').value.trim();
    if (!matchId) return;
    $('#joinResult').textContent = 'Joining\u2026';
    const res = await supExec('api_joinMatch', { matchId });
    if (!res.ok) { $('#joinResult').textContent = 'Join failed: ' + (res.error || 'unknown error'); toast('Join failed: ' + (res.error || 'unknown error'), { type: 'error' }); return; }
    state.activeMatchId = matchId;
    $('#joinResult').textContent = 'Joined.'; toast('Joined match.', { type: 'success' }); await refreshMatch();
    enterMatchMode();
  }

  function populateAssignDeckSelect(match) {
    const sel = $('#assignDeckSelect'); sel.innerHTML = '';
    if (!match) return;
    const choices = state.decks.filter(d => d.format === match.format);
    for (const deck of choices) { const opt = document.createElement('option'); opt.value = deck.id; opt.textContent = (deck.name || 'Untitled') + ' (' + totalCount(deck) + ' cards)'; sel.appendChild(opt); }
    if (!choices.length) { const opt = document.createElement('option'); opt.value = ''; opt.textContent = 'No ' + match.format + ' decks found'; sel.appendChild(opt); }
  }

  function getHandCountForMySeat(match) {
    const seat = match?.viewerSeat; if (!seat) return null;
    const hand = match?.game?.zones?.[seat]?.hand;
    if (Array.isArray(hand)) return hand.length;
    if (hand && typeof hand === 'object' && Number.isFinite(hand.count)) return hand.count;
    return null;
  }

  function renderLobby(match) {
    const panel = $('#lobbyPanel');
    const has = !!match && !!state.activeMatchId;
    panel.style.display = has ? '' : 'none';
    if (!has) return;
    const botInfo = match?.botsBySeat ? Object.entries(match.botsBySeat).map(([seat, b]) => \`bot@\${seat}:\${b?.difficulty || 'easy'}\`).join(', ') : '';
    $('#matchSummary').textContent = 'Match ' + match.matchId + ' \u2022 ' + match.format + ' \u2022 phase: ' + (match.phase || 'lobby') + (botInfo ? (' \u2022 ' + botInfo) : '');
    populateAssignDeckSelect(match);
    const list = $('#playerList'); list.innerHTML = '';
    const readyBy = match.readyByUserId || {};
    for (const p of (match.players || [])) {
      const row = document.createElement('div'); row.className = 'resultRow';
      const ready = !!readyBy[p.userId]; const deckAssigned = !!(match.decks && match.decks[p.seat]); const isBot = !!p.isBot;
      const who = isBot ? (escapeHtml(p.username) + ' <span class="pill" style="border-color:rgba(11,116,255,0.25);color:#0a4db3;background:rgba(11,116,255,0.10);">Bot</span>') : ('@' + escapeHtml(p.username));
      const hostBadge = (p.userId === match.hostUserId) ? ' <span class="pill" style="border-color:rgba(245,158,11,0.3);color:#9a5a00;background:rgba(245,158,11,0.10);">Host</span>' : '';
      row.innerHTML = '<div style="min-width:0; flex: 1;"><div style="font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Seat ' + p.seat + ': ' + who + hostBadge + '</div><div class="small">' + (deckAssigned ? 'Deck assigned' : 'No deck') + (isBot && p.difficulty ? (' \u2022 ' + escapeHtml(p.difficulty)) : '') + ' \u2022 ' + (ready ? '<span style="color:var(--success);font-weight:700;">Ready</span>' : '<span style="color:var(--muted);">Not ready</span>') + '</div></div>';
      list.appendChild(row);
    }
    // Turn order display for multiplayer lobbies
    const turnOrderEl = $('#lobbyTurnOrder');
    const players = match.players || [];
    if (players.length >= 3) {
      const seats = players.slice().sort((a, b) => a.seat - b.seat);
      let html = '<div class="lobbyTurnOrder"><span class="turnLabel">Turn order:</span>';
      for (const p of seats) {
        const isMe = p.userId === state.user?.id;
        const label = p.isBot ? p.username : ('@' + p.username);
        html += '<span class="seatChip' + (isMe ? ' me' : '') + '">' + p.seat + '. ' + escapeHtml(label) + '</span>';
      }
      html += '</div>';
      turnOrderEl.innerHTML = html;
    } else {
      turnOrderEl.innerHTML = '';
    }
    const isReady = !!readyBy[state.user?.id];
    $('#btnReady').textContent = isReady ? 'Unready' : 'Ready';
    const isHost = match.hostUserId === state.user?.id;
    $('#btnStartGame').disabled = !isHost || match.phase !== 'lobby';
    const me = (match.players || []).find(p => p.userId === state.user?.id);
    if (me && match.decks && match.decks[me.seat]) { const assigned = match.decks[me.seat].deckId; if (assigned) $('#assignDeckSelect').value = assigned; }
    const showMulligan = match.phase === 'mulligan' && !!match.viewerSeat;
    $('#mulliganPanel').style.display = showMulligan ? '' : 'none';
    if (showMulligan) {
      const seat = match.viewerSeat;
      const handCount = getHandCountForMySeat(match);
      const mulligansTaken = Number(match?.game?.mulligansBySeat?.[seat] || 0);
      const kept = !!match?.game?.keptBySeat?.[seat];
      $('#handCountVal').textContent = handCount == null ? '?' : String(handCount);
      $('#mulliganCountVal').textContent = String(mulligansTaken);
      const mcPill = $('#mulliganCountPill');
      if (mcPill) mcPill.style.borderColor = mulligansTaken > 0 ? 'rgba(245,158,11,0.35)' : '';
      $('#btnMulligan').disabled = kept;
      $('#btnKeep').disabled = kept;
      const allKept = !!match?.game?.keptBySeat && Object.values(match.game.keptBySeat).every(Boolean);
      $('#mulliganMsg').textContent = allKept ? 'All players kept. Game advancing shortly.' : (kept ? 'Waiting for other players to keep\u2026' : '');
      const mulliganHandEl = $('#mulliganHand');
      mulliganHandEl.innerHTML = '';
      const myZones = match?.game?.zones?.[seat];
      const handCards = Array.isArray(myZones?.hand) ? myZones.hand : [];
      if (handCards.length) {
        for (const id of handCards) {
          mulliganHandEl.appendChild(renderCardImg(id, { zone: 'hand', seat, w: 100, h: 140 }));
        }
      } else {
        mulliganHandEl.innerHTML = '<div class="small">No cards in hand.</div>';
      }
    }
  }

  function cardMeta(id) { return state.cardIndex?.[id] || null; }
  function uniq(arr) { const out = []; const set = new Set(); for (const x of (arr || [])) { if (!x || set.has(x)) continue; set.add(x); out.push(x); } return out; }

  function collectVisibleCardIds(match) {
    const ids = []; const zones = match?.game?.zones || {};
    for (const [seatStr, z] of Object.entries(zones)) {
      if (!z || typeof z !== 'object') continue;
      for (const zoneName of ['hand','battlefield','graveyard','exile','command']) { const v = z[zoneName]; if (Array.isArray(v)) { for (const id of v) ids.push(id); } }
    }
    return uniq(ids);
  }

  async function hydrateCardIndexForMatch(match) {
    const ids = collectVisibleCardIds(match); if (!ids.length) return;
    const missing = ids.filter(id => !state.cardIndex[id]); if (!missing.length) return;
    const res = await supExec('api_getCardsBulk', { ids: missing });
    state.cardIndex = { ...state.cardIndex, ...(res?.byId || {}) };
  }

  function setSelected(sel) {
    state.selected = sel || { id: null, zone: null, seat: null };
    const c = state.selected.id ? cardMeta(state.selected.id) : null;
    const panel = $('#inspectFloat');
    const img = $('#inspectorImg'); const title = $('#inspectorTitle'); const sub = $('#inspectorSub');
    $$('.cardImg').forEach(el => el.classList.remove('selected'));
    if (!c) {
      if (panel) panel.classList.remove('visible');
      img.src = ''; title.textContent = ''; sub.textContent = '';
      $('#btnPlaySelected').disabled = true; $('#btnToGraveyard').disabled = true; $('#btnInspect').disabled = true;
      return;
    }
    if (panel) panel.classList.add('visible');
    img.src = c.imageNormal || c.imageSmall || '';
    title.textContent = c.name || state.selected.id;
    const cmcStr = c.cmc != null ? ' \u2022 ' + c.cmc + ' mana' : '';
    sub.textContent = (c.typeLine || '') + cmcStr + (state.selected.zone ? ' \u2022 ' + state.selected.zone : '');
    const canAfford = (Number(c?.cmc) || 0) <= (state.lastMatch?.game?.manaBySeat?.[state.lastMatch.viewerSeat]?.current || 0);
    var playBtn = $('#btnPlaySelected');
    playBtn.disabled = !(state.selected.zone === 'hand' && state.selected.seat === state.lastMatch?.viewerSeat && canAfford);
    if (state.selected.zone === 'hand') {
      var ct = clientCardType(state.selected.id);
      playBtn.textContent = (ct === 'instant' || ct === 'sorcery') ? 'Cast spell' : 'Play to battlefield';
    }
    $('#btnToGraveyard').disabled = !(state.selected.zone === 'battlefield' && state.selected.seat === state.lastMatch?.viewerSeat);
    $('#btnInspect').disabled = !c;
    $$('.cardImg[data-card-id="' + state.selected.id + '"]').forEach(el => el.classList.add('selected'));
  }

  function openCardModal(cardId, zone) {
    const c = cardMeta(cardId);
    if (!c) return;
    $('#cardModalImg').src = c.imageNormal || c.imageSmall || '';
    $('#cardModalImg').alt = c.name || cardId;
    $('#cardModalName').textContent = c.name || cardId;
    $('#cardModalMana').textContent = c.manaCost || '';
    $('#cardModalMana').style.display = c.manaCost ? '' : 'none';
    $('#cardModalType').textContent = c.typeLine || '';
    $('#cardModalOracle').textContent = c.oracleText || 'No oracle text.';
    $('#cardModalZone').textContent = zone ? ('Zone: ' + zone) : '';
    $('#cardModal').style.display = '';
  }

  function closeCardModal() {
    $('#cardModal').style.display = 'none';
  }

  function clientCardType(id) {
    var tl = String(cardMeta(id)?.typeLine || '').toLowerCase();
    if (tl.includes('creature')) return 'creature';
    if (tl.includes('instant')) return 'instant';
    if (tl.includes('sorcery')) return 'sorcery';
    if (tl.includes('enchantment')) return 'enchantment';
    if (tl.includes('artifact')) return 'artifact';
    if (tl.includes('land')) return 'land';
    return 'unknown';
  }

  function getCombatEligibleAttackers(match) {
    var mySeat = match?.viewerSeat;
    if (!mySeat) return [];
    var bf = match?.game?.zones?.[mySeat]?.battlefield || [];
    var out = [];
    for (var i = 0; i < bf.length; i++) {
      var cid = bf[i];
      if (clientCardType(cid) !== 'creature') continue;
      var cs = match?.game?.cardState?.[cid];
      if (cs && cs.tapped) continue;
      if (cs && cs.summoningSick) continue;
      out.push(cid);
    }
    return out;
  }

  function getCombatEligibleBlockers(match) {
    var mySeat = match?.viewerSeat;
    if (!mySeat) return [];
    var bf = match?.game?.zones?.[mySeat]?.battlefield || [];
    var out = [];
    for (var i = 0; i < bf.length; i++) {
      var cid = bf[i];
      if (clientCardType(cid) !== 'creature') continue;
      var cs = match?.game?.cardState?.[cid];
      if (cs && cs.tapped) continue;
      out.push(cid);
    }
    return out;
  }

  function renderCardImg(id, opts) {
    const options = opts || {};
    const c = cardMeta(id); const img = document.createElement('img');
    img.className = 'cardImg'; img.src = c?.imageSmall || c?.imageNormal || ''; img.alt = c?.name || id;
    img.width = options.w || 64; img.height = options.h || 90;
    img.decoding = 'async';
    if (options.lazy) img.loading = 'lazy';
    img.dataset.cardId = id;
    if (state.selected?.id === id && state.selected?.zone === options.zone && state.selected?.seat === options.seat) img.classList.add('selected');
    img.onclick = () => setSelected({ id, zone: options.zone || null, seat: options.seat || null });
    if (options.onDblClick) img.ondblclick = options.onDblClick;
    else img.ondblclick = () => openCardModal(id, options.zone || null);
    // Wrap battlefield creatures with P/T badge + summoning sickness + tapped + attacking
    if (options.zone === 'battlefield' && clientCardType(id) === 'creature') {
      var wrap = document.createElement('div');
      wrap.className = 'cardWrap';
      var cs = options.cardState;
      if (cs && cs.tapped) wrap.classList.add('tapped');
      if (cs && cs.summoningSick) {
        wrap.classList.add('summonSick');
        var ssIcon = document.createElement('div');
        ssIcon.className = 'summonSickIcon';
        ssIcon.textContent = '\u23F3';
        wrap.appendChild(ssIcon);
      }
      if (options.isAttacking) {
        var atkIcon = document.createElement('div');
        atkIcon.className = 'attackIcon';
        atkIcon.textContent = '\u2694';
        wrap.appendChild(atkIcon);
      }
      wrap.appendChild(img);
      var badge = document.createElement('div');
      badge.className = 'ptBadge';
      var pw = c?.power != null ? String(c.power) : '?';
      var tw = c?.toughness != null ? String(c.toughness) : '?';
      var dmg = cs ? (Number(cs.damage) || 0) : 0;
      if (dmg > 0) {
        var remaining = (Number(tw) || 0) - dmg;
        badge.innerHTML = escapeHtml(pw) + '/<span class="ptDamaged">' + remaining + '</span>';
      } else {
        badge.textContent = pw + '/' + tw;
      }
      wrap.appendChild(badge);
      // Forward click/dblclick to wrapper level too
      wrap.dataset.cardId = id;
      return wrap;
    }
    return img;
  }

  function renderBoardSeat(match, seat, isViewer) {
    const zones = match?.game?.zones?.[seat];
    const p = (match.players || []).find(x => x.seat === seat);
    const name = p ? (p.isBot ? (p.username + ' (Bot)') : ('@' + p.username)) : ('Seat ' + seat);
    const life = match?.game?.lifeBySeat?.[seat];
    const isActive = match?.game?.activePlayerSeat === seat;

    const el = document.createElement('div');
    el.className = 'seatPanel' + (isActive ? ' active' : '');

    const bar = document.createElement('div');
    bar.className = 'seatBar';
    bar.innerHTML = '<div class="seatName">' + escapeHtml(name) + '</div>'
      + '<div class="lifeBadge"><span class="lifeIcon">\u2764</span> ' + (life == null ? '?' : String(life)) + '</div>';
    el.appendChild(bar);

    const lib = zones?.library; const hand = zones?.hand;
    const gy = zones?.graveyard; const ex = zones?.exile; const cmd = zones?.command;
    const zr = document.createElement('div');
    zr.className = 'zoneRow';
    const counts = [
      ['Lib', Array.isArray(lib) ? lib.length : Number(lib?.count || 0)],
      ['Hand', Array.isArray(hand) ? hand.length : Number(hand?.count || 0)],
      ['GY', Array.isArray(gy) ? gy.length : 0],
      ['Exile', Array.isArray(ex) ? ex.length : 0],
    ];
    if (Array.isArray(cmd) && cmd.length) counts.push(['Cmd', cmd.length]);
    for (const [label, n] of counts) {
      const b = document.createElement('div');
      b.className = 'zoneBadge';
      b.textContent = label + ' ' + n;
      zr.appendChild(b);
    }
    el.appendChild(zr);

    const bf = Array.isArray(zones?.battlefield) ? zones.battlefield : [];
    const bfArea = document.createElement('div');
    bfArea.className = 'bfArea';
    // Determine which cards are attacking (from combat state or pending)
    var combatAttackers = match?.game?.combat?.attackers || {};
    if (bf.length) {
      for (const id of bf) {
        var cs = match?.game?.cardState?.[id] || null;
        var isAtk = !!combatAttackers[id] || !!state.pendingAttackers[id];
        var cardEl = renderCardImg(id, { zone: 'battlefield', seat, w: 72, h: 100, lazy: !isViewer, cardState: cs, isAttacking: isAtk });
        bfArea.appendChild(cardEl);
      }
    } else {
      bfArea.innerHTML = '<div class="emptyZone">No permanents</div>';
    }
    // Apply combat CSS classes after creating elements
    if (state.combatMode && bf.length) {
      var eligibleAtk = isViewer ? getCombatEligibleAttackers(match) : [];
      var eligibleBlk = isViewer ? getCombatEligibleBlockers(match) : [];
      var cardEls = bfArea.querySelectorAll('.cardWrap');
      for (var cei = 0; cei < cardEls.length; cei++) {
        var cWrap = cardEls[cei];
        var cid = cWrap.dataset.cardId;
        if (!cid) continue;
        if (state.combatMode === 'selecting_attackers' && isViewer) {
          if (state.pendingAttackers[cid]) {
            cWrap.classList.add('attacking');
          } else if (eligibleAtk.indexOf(cid) >= 0) {
            cWrap.classList.add('canAttack');
          } else if (clientCardType(cid) === 'creature') {
            cWrap.classList.add('combatIneligible');
          }
        } else if (state.combatMode === 'selecting_blockers') {
          if (isViewer) {
            // Viewer's creatures
            var isBlocking = false;
            for (var bk in state.pendingBlockers) { if (state.pendingBlockers[bk] === cid) { isBlocking = true; break; } }
            if (isBlocking) {
              cWrap.classList.add('blocking');
            } else if (eligibleBlk.indexOf(cid) >= 0) {
              cWrap.classList.add('canBlock');
            }
          } else {
            // Opponent attackers targeting viewer
            if (combatAttackers[cid] && Number(combatAttackers[cid]) === match.viewerSeat) {
              cWrap.classList.add('attacking');
            }
          }
        }
      }
    }
    el.appendChild(bfArea);

    return el;
  }

  function renderTurnBar(match) {
    const bar = $('#turnBar');
    const activeSeat = match.game?.activePlayerSeat;
    const activePlayer = (match.players || []).find(p => p.seat === activeSeat);
    const activeName = activeSeat === match.viewerSeat ? 'You' : (activePlayer ? (activePlayer.isBot ? activePlayer.username : ('@' + activePlayer.username)) : ('Seat ' + activeSeat));
    const step = match.game?.step || 'main1';
    const isMyTurn = activeSeat === match.viewerSeat;
    const isMyPriority = match.game?.prioritySeat === match.viewerSeat;
    const seats = (match.players || []).map(p => p.seat).sort((a, b) => a - b);
    const isMulti = seats.length > 2;
    const pendingAtkCount = Object.keys(state.pendingAttackers).length;
    const pendingBlkCount = Object.keys(state.pendingBlockers).length;

    const mana = match.game?.manaBySeat?.[match.viewerSeat] || { current: 0, max: 0 };
    const cacheKey = (match.game?.turn || '?') + ':' + activeSeat + ':' + step + ':' + seats.length + ':' + mana.current + '/' + mana.max + ':' + pendingAtkCount + ':' + pendingBlkCount + ':' + (state.combatMode || 'none');
    if (bar.dataset.cacheKey === cacheKey) return;
    bar.dataset.cacheKey = cacheKey;

    var manaHtml = '<div class="manaBar">';
    for (var mi = 0; mi < mana.max; mi++) {
      manaHtml += '<div class="manaGem ' + (mi < mana.current ? 'full' : 'empty') + '"></div>';
    }
    manaHtml += '<div class="manaText">' + mana.current + '/' + mana.max + '</div></div>';

    var turnOrderHtml = '';
    if (isMulti) {
      turnOrderHtml = '<div class="turnOrder">';
      for (var tsi = 0; tsi < seats.length; tsi++) {
        var s = seats[tsi];
        var cls = s === activeSeat ? 'turnDot now' : 'turnDot';
        var label = s === match.viewerSeat ? 'U' : String(s);
        turnOrderHtml += '<div class="' + cls + '">' + label + '</div>';
      }
      turnOrderHtml += '</div>';
    }

    // Phase pills
    var phaseHtml = '<div class="phaseBar">';
    phaseHtml += '<div class="phasePill' + (step === 'main1' ? ' active' : '') + '">M1</div>';
    phaseHtml += '<div class="phasePill' + ((step === 'combat_attackers' || step === 'combat_blockers') ? ' active' : '') + '">CMB</div>';
    phaseHtml += '<div class="phasePill' + (step === 'main2' ? ' active' : '') + '">M2</div>';
    phaseHtml += '</div>';

    // Context-sensitive buttons
    var buttonsHtml = '';
    if (step === 'main1' && isMyTurn) {
      buttonsHtml = '<button id="btnGoToCombat" class="btn btnPrimary">Go to Combat</button>'
        + '<button id="btnGameEndTurn" class="btn">End Turn</button>';
    } else if (step === 'combat_attackers' && isMyTurn) {
      buttonsHtml = '<button id="btnConfirmAttackers" class="btn btnPrimary">Confirm Attack' + (pendingAtkCount ? ' (' + pendingAtkCount + ')' : '') + '</button>'
        + '<button id="btnSkipCombat" class="btn">Skip Combat</button>';
    } else if (step === 'combat_blockers' && isMyPriority) {
      buttonsHtml = '<button id="btnConfirmBlockers" class="btn btnPrimary">Confirm Blocks' + (pendingBlkCount ? ' (' + pendingBlkCount + ')' : '') + '</button>'
        + '<button id="btnNoBlocks" class="btn">No Blocks</button>';
    } else if (step === 'main2' && isMyTurn) {
      buttonsHtml = '<button id="btnGameEndTurn" class="btn btnPrimary">End Turn</button>';
    } else if (step === 'combat_blockers' && !isMyPriority) {
      var defenderPlayer = (match.players || []).find(function(p) { return p.seat === match.game?.prioritySeat; });
      var defName = defenderPlayer ? (defenderPlayer.isBot ? defenderPlayer.username : ('@' + defenderPlayer.username)) : 'Opponent';
      buttonsHtml = '<div class="combatBanner">\u2694 Waiting for ' + escapeHtml(defName) + ' to declare blockers\u2026</div>';
    } else {
      buttonsHtml = '<button id="btnGameEndTurn" class="btn btnPrimary" disabled>End Turn</button>';
    }

    bar.innerHTML = '<div class="turnInfo">Turn <span class="turnHighlight">' + (match.game?.turn || '?') + '</span></div>'
      + '<div class="turnInfo">' + (isMyTurn ? '<span class="turnHighlight">Your turn</span>' : escapeHtml(activeName) + "'s turn") + '</div>'
      + phaseHtml
      + manaHtml
      + turnOrderHtml
      + '<button id="btnGameDraw" class="btn">Draw</button>'
      + buttonsHtml;

    bar.querySelector('#btnGameDraw').onclick = drawDebug;
    var endTurnBtn = bar.querySelector('#btnGameEndTurn');
    if (endTurnBtn) endTurnBtn.onclick = endTurn;
    var goToCombatBtn = bar.querySelector('#btnGoToCombat');
    if (goToCombatBtn) goToCombatBtn.onclick = goToCombat;
    var confirmAtkBtn = bar.querySelector('#btnConfirmAttackers');
    if (confirmAtkBtn) confirmAtkBtn.onclick = confirmAttackers;
    var skipCombatBtn = bar.querySelector('#btnSkipCombat');
    if (skipCombatBtn) skipCombatBtn.onclick = skipCombat;
    var confirmBlkBtn = bar.querySelector('#btnConfirmBlockers');
    if (confirmBlkBtn) confirmBlkBtn.onclick = confirmBlockers;
    var noBlocksBtn = bar.querySelector('#btnNoBlocks');
    if (noBlocksBtn) noBlocksBtn.onclick = noBlocks;
  }

  function renderGame(match) {
    const show = !!match && match.phase === 'playing' && !!match.viewerSeat;
    $('#gamePanel').style.display = show ? '' : 'none';
    if (!show) return;

    const mySeat = match.viewerSeat;
    const step = match.game?.step || 'main1';

    // Auto-detect combat mode
    if (step === 'combat_blockers' && match.game?.prioritySeat === mySeat) {
      state.combatMode = 'selecting_blockers';
    } else if (step === 'combat_attackers' && match.game?.activePlayerSeat === mySeat) {
      state.combatMode = 'selecting_attackers';
    } else if (step === 'main1' || step === 'main2') {
      state.combatMode = null;
      state.pendingAttackers = {};
      state.pendingBlockers = {};
      state.selectedBlocker = null;
    }

    const seats = (match.players || []).map(p => p.seat).sort((a, b) => a - b);
    const oppSeats = seats.filter(s => s !== mySeat);

    const oppEl = $('#oppSide'); oppEl.innerHTML = '';
    const isMulti = oppSeats.length >= 2;
    oppEl.classList.toggle('multi', isMulti);
    for (const seat of oppSeats) {
      oppEl.appendChild(renderBoardSeat(match, seat, false));
    }

    renderTurnBar(match);

    const myEl = $('#mySide'); myEl.innerHTML = '';
    myEl.appendChild(renderBoardSeat(match, mySeat, true));

    const zones = match?.game?.zones?.[mySeat];
    const hand = Array.isArray(zones?.hand) ? zones.hand : [];
    const handTray = document.createElement('div');
    handTray.className = 'handTray';
    if (!hand.length) {
      handTray.innerHTML = '<div class="emptyZone">No cards in hand</div>';
    } else {
      const myMana = match.game?.manaBySeat?.[mySeat] || { current: 0, max: 0 };
      for (const id of hand) {
        const img = renderCardImg(id, {
          zone: 'hand', seat: mySeat, w: 90, h: 126,
          onDblClick: async () => { setSelected({ id, zone: 'hand', seat: mySeat }); await playSelectedToBattlefield(); }
        });
        const cmc = Number(cardMeta(id)?.cmc) || 0;
        if (cmc > myMana.current) img.classList.add('unplayable');
        handTray.appendChild(img);
      }
    }
    myEl.appendChild(handTray);

    // Wire up combat clicks on battlefield cards
    if (state.combatMode) {
      var allWraps = document.querySelectorAll('#gameBoard .cardWrap[data-card-id]');
      for (var wi = 0; wi < allWraps.length; wi++) {
        (function(wrap) {
          var cardId = wrap.dataset.cardId;
          if (!cardId) return;
          wrap.style.cursor = 'pointer';
          wrap.onclick = function(e) {
            e.stopPropagation();
            // Show in inspector
            var zone = 'battlefield';
            var cardSeat = null;
            // Find which seat this card belongs to
            var allS = (match.players || []).map(function(p) { return p.seat; });
            for (var si = 0; si < allS.length; si++) {
              var sBf = match?.game?.zones?.[allS[si]]?.battlefield || [];
              if (sBf.indexOf(cardId) >= 0) { cardSeat = allS[si]; break; }
            }
            setSelected({ id: cardId, zone: zone, seat: cardSeat });

            if (state.combatMode === 'selecting_attackers' && cardSeat === mySeat) {
              toggleAttacker(cardId);
            } else if (state.combatMode === 'selecting_blockers') {
              handleBlockerClick(cardId, cardSeat === mySeat);
            }
          };
          // Also forward clicks on the img inside
          var innerImg = wrap.querySelector('.cardImg');
          if (innerImg) {
            innerImg.onclick = function(e) {
              e.stopPropagation();
              wrap.onclick(e);
            };
          }
        })(allWraps[wi]);
      }
    }

    if (state.selected?.id) {
      if (!collectVisibleCardIds(match).includes(state.selected.id)) setSelected(null);
      else setSelected(state.selected);
    } else { setSelected(null); }
  }

  async function refreshMatch() {
    if (!state.activeMatchId) { $('#matchDebug').textContent = 'No active match.'; renderLobby(null); $('#gamePanel').style.display = 'none'; return; }
    const match = await supExec('api_getMatch', { matchId: state.activeMatchId });
    state.lastMatch = match; await hydrateCardIndexForMatch(match);
    $('#matchDebug').textContent = JSON.stringify(match, null, 2);
    renderLobby(match); renderGame(match);
    if (document.querySelector('.appRoot').classList.contains('matchActive')) updateMatchBar();
  }

  async function drawDebug() {
    if (!state.activeMatchId) return;
    $('#matchActionResult').textContent = 'Sending action\u2026';
    const res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'DRAW', n: 1 } });
    if (!res.ok) { $('#matchActionResult').textContent = 'Action failed: ' + res.error; toast('Action failed: ' + res.error, { type: 'error' }); return; }
    $('#matchActionResult').textContent = 'OK'; await refreshMatch();
  }

  async function endTurn() {
    if (!state.activeMatchId) return;
    // Clear combat UI state
    state.combatMode = null;
    state.pendingAttackers = {};
    state.pendingBlockers = {};
    state.selectedBlocker = null;
    const hasBot = (state.lastMatch?.players || []).some(p => p.isBot);
    const res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'END_TURN' } });
    if (!res.ok) { toast('End turn failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    if (hasBot) {
      const bar = $('#turnBar');
      if (bar) bar.innerHTML = '<div class="botThinking"><span class="spinner"></span> Bot is thinking\u2026</div>';
      await new Promise(r => setTimeout(r, 1200 + Math.floor(Math.random() * 800)));
    }
    await refreshMatch();
    if (hasBot) {
      const log = res.match?.log || [];
      const botPlays = log.filter(e => e.type === 'BOT_PLAY' && e.t > Date.now() - 5000);
      if (botPlays.length) toast('Bot played ' + botPlays.length + ' card' + (botPlays.length > 1 ? 's' : '') + '.', { type: 'info', ms: 2000 });
      else { const botPass = log.find(e => e.type === 'BOT_PASS' && e.t > Date.now() - 5000); if (botPass) toast('Bot passed.', { type: 'info', ms: 1500 }); }
    }
  }

  async function goToCombat() {
    if (!state.activeMatchId) return;
    var res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'GO_TO_COMBAT' } });
    if (!res.ok) { toast('Go to combat failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    state.combatMode = 'selecting_attackers';
    state.pendingAttackers = {};
    await refreshMatch();
  }

  async function confirmAttackers() {
    if (!state.activeMatchId) return;
    var attackerCount = Object.keys(state.pendingAttackers).length;
    if (!attackerCount) {
      // No attackers selected — skip combat instead
      await skipCombat();
      return;
    }
    var hasBot = (state.lastMatch?.players || []).some(function(p) { return p.isBot; });
    var res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'DECLARE_ATTACKERS', attackers: state.pendingAttackers } });
    if (!res.ok) { toast('Declare attackers failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    state.pendingAttackers = {};
    state.combatMode = null;
    if (hasBot) {
      var bar = $('#turnBar');
      if (bar) bar.innerHTML = '<div class="botThinking"><span class="spinner"></span> Bot is blocking\u2026</div>';
      await new Promise(function(r) { setTimeout(r, 800 + Math.floor(Math.random() * 600)); });
    }
    await refreshMatch();
  }

  async function skipCombat() {
    if (!state.activeMatchId) return;
    var res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'SKIP_COMBAT' } });
    if (!res.ok) { toast('Skip combat failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    state.combatMode = null;
    state.pendingAttackers = {};
    await refreshMatch();
  }

  async function confirmBlockers() {
    if (!state.activeMatchId) return;
    var blockerCount = Object.keys(state.pendingBlockers).length;
    if (!blockerCount) {
      await noBlocks();
      return;
    }
    var res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'DECLARE_BLOCKERS', blockers: state.pendingBlockers } });
    if (!res.ok) { toast('Declare blockers failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    state.combatMode = null;
    state.pendingBlockers = {};
    state.selectedBlocker = null;
    var hasBot = (state.lastMatch?.players || []).some(function(p) { return p.isBot; });
    if (hasBot) {
      var bar = $('#turnBar');
      if (bar) bar.innerHTML = '<div class="botThinking"><span class="spinner"></span> Bot is thinking\u2026</div>';
      await new Promise(function(r) { setTimeout(r, 800 + Math.floor(Math.random() * 600)); });
    }
    await refreshMatch();
  }

  async function noBlocks() {
    if (!state.activeMatchId) return;
    var res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'NO_BLOCKS' } });
    if (!res.ok) { toast('No blocks failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    state.combatMode = null;
    state.pendingBlockers = {};
    state.selectedBlocker = null;
    var hasBot = (state.lastMatch?.players || []).some(function(p) { return p.isBot; });
    if (hasBot) {
      var bar = $('#turnBar');
      if (bar) bar.innerHTML = '<div class="botThinking"><span class="spinner"></span> Bot is thinking\u2026</div>';
      await new Promise(function(r) { setTimeout(r, 800 + Math.floor(Math.random() * 600)); });
    }
    await refreshMatch();
  }

  function toggleAttacker(cardId) {
    if (!state.lastMatch) return;
    var eligible = getCombatEligibleAttackers(state.lastMatch);
    if (eligible.indexOf(cardId) < 0) return;
    if (state.pendingAttackers[cardId]) {
      delete state.pendingAttackers[cardId];
    } else {
      // Target the first opponent seat
      var mySeat = state.lastMatch.viewerSeat;
      var allSeats = (state.lastMatch.players || []).map(function(p) { return p.seat; }).sort(function(a,b) { return a - b; });
      var targetSeat = null;
      for (var i = 0; i < allSeats.length; i++) {
        if (allSeats[i] !== mySeat) { targetSeat = allSeats[i]; break; }
      }
      if (targetSeat) state.pendingAttackers[cardId] = targetSeat;
    }
    renderGame(state.lastMatch);
  }

  function handleBlockerClick(cardId, isMine) {
    if (isMine) {
      // Select this creature as blocker
      state.selectedBlocker = cardId;
      toast('Blocker selected \u2014 now click an attacking creature to assign.', { type: 'info', ms: 1500 });
      renderGame(state.lastMatch);
    } else {
      // Clicking opponent attacker — assign selectedBlocker
      if (!state.selectedBlocker) {
        toast('Select one of your creatures first, then click an attacker.', { type: 'warn', ms: 1500 });
        return;
      }
      // Verify this is an attacker targeting us
      var combat = state.lastMatch?.game?.combat;
      if (!combat || !combat.attackers[cardId] || Number(combat.attackers[cardId]) !== state.lastMatch.viewerSeat) {
        toast('That creature is not attacking you.', { type: 'warn', ms: 1500 });
        return;
      }
      state.pendingBlockers[cardId] = state.selectedBlocker;
      state.selectedBlocker = null;
      renderGame(state.lastMatch);
    }
  }

  async function assignDeckToSeat() {
    if (!state.activeMatchId) return;
    const deckId = $('#assignDeckSelect').value;
    if (!deckId) { $('#lobbyMsg').textContent = 'No deck selected.'; toast('No deck selected.', { type: 'warn' }); return; }
    $('#lobbyMsg').textContent = 'Assigning deck\u2026';
    const res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'ASSIGN_DECK', deckId } });
    if (!res.ok) { $('#lobbyMsg').textContent = 'Assign failed: ' + (res.error || 'unknown'); toast('Assign failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    $('#lobbyMsg').textContent = 'Assigned.'; toast('Deck assigned.', { type: 'success' }); await refreshMatch();
  }

  async function toggleReady() {
    if (!state.activeMatchId) return;
    const cur = !!(state.lastMatch?.readyByUserId || {})[state.user?.id];
    $('#lobbyMsg').textContent = (cur ? 'Unready\u2026' : 'Ready\u2026');
    const res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'SET_READY', ready: !cur } });
    if (!res.ok) { $('#lobbyMsg').textContent = 'Failed: ' + (res.error || 'unknown'); toast('Ready failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    $('#lobbyMsg').textContent = 'OK'; await refreshMatch();
  }

  async function startGame() {
    if (!state.activeMatchId) return;
    $('#lobbyMsg').textContent = 'Starting game\u2026';
    const res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'START_GAME' } });
    if (!res.ok) { $('#lobbyMsg').textContent = 'Start failed: ' + (res.error || 'unknown'); toast('Start failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    $('#lobbyMsg').textContent = 'Started.'; toast('Game started (phase moved to mulligan).', { type: 'success' }); await refreshMatch();
  }

  async function mulligan() {
    if (!state.activeMatchId) return;
    $('#btnMulligan').disabled = true;
    $('#btnKeep').disabled = true;
    $('#mulliganMsg').innerHTML = '<span class="spinner"></span> Drawing new hand\u2026';
    const res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'MULLIGAN' } });
    if (!res.ok) {
      $('#mulliganMsg').textContent = 'Failed: ' + (res.error || 'unknown');
      toast('Mulligan failed: ' + (res.error || 'unknown'), { type: 'error' });
      $('#btnMulligan').disabled = false; $('#btnKeep').disabled = false;
      return;
    }
    await refreshMatch();
  }

  async function keepHand() {
    if (!state.activeMatchId) return;
    $('#btnKeep').disabled = true;
    $('#btnMulligan').disabled = true;
    $('#mulliganMsg').innerHTML = '<span class="spinner"></span> Keeping\u2026';
    const res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'KEEP_HAND' } });
    if (!res.ok) {
      $('#mulliganMsg').textContent = 'Failed: ' + (res.error || 'unknown');
      toast('Keep failed: ' + (res.error || 'unknown'), { type: 'error' });
      $('#btnKeep').disabled = false; $('#btnMulligan').disabled = false;
      return;
    }
    toast('Hand kept.', { type: 'success', ms: 1500 });
    await refreshMatch();
  }

  function showSpellCastAnimation(cardId) {
    var c = cardMeta(cardId);
    if (!c) return;
    var overlay = document.createElement('div');
    overlay.className = 'spellOverlay';
    var animImg = document.createElement('img');
    animImg.src = c.imageNormal || c.imageSmall || '';
    animImg.alt = c.name || cardId;
    overlay.appendChild(animImg);
    document.body.appendChild(overlay);
    setTimeout(function() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 1700);
  }

  async function playSelectedToBattlefield() {
    const sel = state.selected; if (!state.activeMatchId || !sel?.id) return;
    if (!(sel.zone === 'hand' && sel.seat === state.lastMatch?.viewerSeat)) { toast('Select a card in your hand to play.', { type: 'warn' }); return; }
    var isSpell = (clientCardType(sel.id) === 'instant' || clientCardType(sel.id) === 'sorcery');
    const res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'PLAY_FROM_HAND', cardId: sel.id } });
    if (!res.ok) { toast('Play failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    if (isSpell) showSpellCastAnimation(sel.id);
    await refreshMatch();
  }

  async function moveSelectedToGraveyard() {
    const sel = state.selected; if (!state.activeMatchId || !sel?.id) return;
    if (!(sel.zone === 'battlefield' && sel.seat === state.lastMatch?.viewerSeat)) { toast('Select a card on your battlefield.', { type: 'warn' }); return; }
    const res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'MOVE_BATTLEFIELD_TO_GRAVEYARD', cardId: sel.id } });
    if (!res.ok) { toast('Move failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    await refreshMatch();
  }

  function bindEvents() {
    $$('.tabBtn').forEach(btn => { btn.onclick = () => switchTab(btn.dataset.tab); });
    $('#btnNewDeck').onclick = newDeck;
    $('#builderDeck').onchange = () => { setActiveDeck($('#builderDeck').value); $('#saveResult').textContent = ''; };
    $('#deckFormat').onchange = () => { ensureActiveDeck(); state.activeDeck.format = $('#deckFormat').value; if (state.activeDeck.format !== 'commander') { state.activeDeck.commander = null; state.activeDeck.commanderName = null; } updateDeckBuilderUI(); renderDeckSelectors(); };
    $('#btnClearCommander').onclick = () => { ensureActiveDeck(); state.activeDeck.commander = null; state.activeDeck.commanderName = null; updateDeckBuilderUI(); toast('Commander cleared.', { type: 'info' }); };
    $('#btnSaveDeck').onclick = saveActiveDeck;
    $('#btnDeleteDeck').onclick = deleteActiveDeck;
    $('#btnSearch').onclick = search;
    $('#searchQuery').addEventListener('keydown', (e) => { if (e.key === 'Enter') search(); });
    $('#playFormat').onchange = () => { renderDeckSelectors(); updateOpponentUI(); if (typeof updateDevPanel === 'function') updateDevPanel(); };
    $('#playOpponent').onchange = () => { updateOpponentUI(); if (typeof updateDevPanel === 'function') updateDevPanel(); };
    $('#playBotDifficulty').onchange = () => { if (typeof updateDevPanel === 'function') updateDevPanel(); };
    $('#playDeck').onchange = () => { if (typeof updateDevPanel === 'function') updateDevPanel(); };
    $('#btnValidateAndCreate').onclick = validateAndCreateMatch;
    $('#btnJoin').onclick = joinMatch;
    $('#btnRefreshMatch').onclick = refreshMatch;
    $('#btnDraw').onclick = drawDebug;
    $('#btnAssignDeck').onclick = assignDeckToSeat;
    $('#btnReady').onclick = toggleReady;
    $('#btnStartGame').onclick = startGame;
    $('#btnMulligan').onclick = mulligan;
    $('#btnKeep').onclick = keepHand;
    $('#btnPlaySelected').onclick = playSelectedToBattlefield;
    $('#btnToGraveyard').onclick = moveSelectedToGraveyard;
    $('#btnInspect').onclick = () => { if (state.selected?.id) openCardModal(state.selected.id, state.selected.zone); };
    $('#cardModalClose').onclick = closeCardModal;
    $('#cardModal').onclick = (e) => { if (e.target === $('#cardModal')) closeCardModal(); };
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCardModal(); });
    $('#btnCreateQsStandard').onclick = createQuickstartStandard;
    $('#btnCreateQsCommanderPopular').onclick = createQuickstartCommanderFromPopular;
    $('#btnQsCommanderSearch').onclick = quickstartCommanderSearch;
    $('#qsCommanderSearch').addEventListener('keydown', (e) => { if (e.key === 'Enter') quickstartCommanderSearch(); });
    $('#btnCreateQsCommanderChosen').onclick = createQuickstartCommanderFromChosen;
    $('#devToggle').onclick = toggleDevPanel;
    $('#devCopyConfig').onclick = () => { try { navigator.clipboard.writeText($('#devConfig').textContent); toast('Config copied.', { type: 'info', ms: 1500 }); } catch(e) { toast('Copy failed.', { type: 'warn' }); } };
    $('#devCopyAll').onclick = () => { try { const all = { config: _devState.lastPayload, validate: _devState.lastValidate, response: _devState.lastResponse }; navigator.clipboard.writeText(JSON.stringify(all, null, 2)); toast('All dev data copied.', { type: 'info', ms: 1500 }); } catch(e) { toast('Copy failed.', { type: 'warn' }); } };
    $('#btnLeaveMatch').onclick = () => { exitMatchMode(); toast('Left match.', { type: 'info', ms: 2000 }); };
  }

  async function boot() {
    if (state.booted || state.booting) return;
    state.booting = true;
    setStatus('Waiting for Sup context\u2026');
    try {
      const boot = await supExec('api_boot');
      state.user = boot.user;
      $('#userLabel').textContent = '@' + boot.user.username;
      bindEvents(); initDevPanel(); switchTab('play'); await loadDecks();
      if (!state.decks.length) { toast('No decks yet \u2014 use Deck Builder \u2192 Quick start to create one fast.', { type: 'info', ms: 5000 }); switchTab('builder'); }
      setStatus('Ready.'); setTimeout(() => setStatus(''), 1000);
      state.booted = true; state.booting = false;
    } catch (err) {
      state.booting = false;
      if (isContextRetryableError(err)) { setStatus('Waiting for Sup context\u2026 (try Refresh; Preview may require "Share with chat")'); setTimeout(() => boot(), 700); return; }
      console.error(err); setStatus('Error: ' + String(err?.message || err || ''));
      toast(String(err?.message || err || ''), { type: 'error', title: 'Error' });
    }
  }

  boot();
</script>
  `;
}

function api_boot() {
    return { user: { id: sup.user.id, username: sup.user.username, pfp: sup.user.pfp?.url || null }, now: Date.now() };
}

function api_listDecks() { return getUserDecks(); }

function api_saveDeck(event) {
    const input = event?.value || {};
    const deck = input.deck;
    if (!deck || typeof deck !== "object") throw new Error("deck is required");
    return upsertDeckForUser(sanitizeDeckForSave(deck));
}

function api_deleteDeck(event) {
    const { deckId } = event?.value || {};
    if (!deckId) throw new Error("deckId is required");
    const decks = getUserDecks().filter((d) => d.id !== deckId);
    sup.user.set(USER_DECKS_KEY, decks);
    return { ok: true };
}

function api_createQuickstartStandardDeck(event) {
    const { color } = event?.value || {};
    const c = String(color || "").trim().toUpperCase();
    if (!['W','U','B','R','G'].includes(c)) throw new Error('color must be one of W U B R G');
    return upsertDeckForUser(buildQuickstartStandardDeck(c));
}

function api_createQuickstartCommanderDeck(event) {
    const { commanderId, commanderName } = event?.value || {};
    let commander = null;
    if (commanderId) { commander = scryfallFetchJsonCached(`${SCRYFALL.card}/${encodeURIComponent(String(commanderId))}`); }
    else if (commanderName) { commander = resolveCommanderByName(String(commanderName)); }
    if (!commander || commander.object !== 'card') throw new Error('commander not found');
    return upsertDeckForUser(buildQuickstartCommanderDeck(commander));
}

function api_searchCards(event) {
    const { query, limit = 20 } = event?.value || {};
    if (!query || typeof query !== "string") throw new Error("query is required");
    const url = `${SCRYFALL.search}?q=${encodeURIComponent(query)}&order=name&unique=cards`;
    const json = scryfallFetchJsonCached(url);
    const data = Array.isArray(json?.data) ? json.data : [];
    return data.slice(0, Math.max(1, Math.min(50, Number(limit) || 20))).map(simplifyCard);
}

function api_getCard(event) {
    const { cardId } = event?.value || {};
    if (!cardId) throw new Error("cardId is required");
    return simplifyCard(scryfallFetchJsonCached(`${SCRYFALL.card}/${encodeURIComponent(cardId)}`));
}

function api_getCardsBulk(event) {
    const { ids } = event?.value || {};
    if (!Array.isArray(ids)) throw new Error("ids must be an array");
    const cleaned = ids.filter((x) => typeof x === "string" && x).slice(0, 200);
    const cards = scryfallGetCardsByIdsCached(cleaned).map(simplifyCard).filter(Boolean);
    const byId = {};
    for (const c of cards) { if (c?.id) byId[c.id] = c; }
    return { byId };
}

function api_validateDeck(event) {
    const { deckId } = event?.value || {};
    if (!deckId) throw new Error("deckId is required");
    const deck = getUserDecks().find((d) => d.id === deckId);
    if (!deck) return { ok: false, errors: ["Deck not found"] };
    return validateDeck(deck);
}

function api_createMatch(event) {
    const { format, hostDeckId, opponent } = event?.value || {};
    if (!format || !["standard","commander"].includes(format)) throw new Error("format must be standard|commander");
    if (!hostDeckId) throw new Error("hostDeckId is required");
    const opp = opponent && typeof opponent === "object" ? opponent : { type: "human" };
    const opponentType = opp.type === "bot" ? "bot" : "human";
    const difficulty = botDifficultyNormalize(opp.difficulty);
    if (opponentType === "bot" && format !== "standard") return { ok: false, error: "bot only supported for standard (v1)" };
    const deck = getUserDecks().find((d) => d.id === hostDeckId);
    if (!deck) throw new Error("deck not found");
    if (deck.format !== format) throw new Error("deck format mismatch");
    const v = validateDeck(deck);
    if (!v.ok) return { ok: false, error: "invalid deck", errors: v.errors };
    const matchId = sup.uuid().slice(0, 8);
    const match = createInitialMatchState({ matchId, format, hostUser: sup.user, hostDeck: deck, opponentType, botDifficulty: difficulty });
    sup.chat.set(matchStoreKey(matchId), match);
    return { ok: true, matchId };
}

function api_joinMatch(event) {
    const { matchId } = event?.value || {};
    if (!matchId) throw new Error("matchId is required");
    const key = matchStoreKey(matchId);
    const match = sup.chat.get(key);
    if (!match) return { ok: false, error: "match not found" };
    if (matchHasBot(match)) return { ok: false, error: "match is vs a bot (cannot join)" };
    if (match.format === "standard" && (match.players || []).length >= 2) return { ok: false, error: "match full" };
    if (match.format === "commander" && (match.players || []).length >= 5) return { ok: false, error: "match full" };
    const already = match.players.find((p) => p.userId === sup.user.id);
    if (!already) {
        match.players.push({ userId: sup.user.id, username: sup.user.username, joinedAt: Date.now(), seat: match.players.length + 1 });
        if (!match.readyByUserId) match.readyByUserId = {};
        match.readyByUserId[sup.user.id] = false;
        sup.chat.set(key, match);
    }
    return { ok: true };
}

function api_getMatch(event) {
    const { matchId } = event?.value || {};
    if (!matchId) throw new Error("matchId is required");
    const match = sup.chat.get(matchStoreKey(matchId));
    if (!match) return null;
    return getMatchViewForUser(match, sup.user.id);
}

function api_matchAction(event) {
    const { matchId, action } = event?.value || {};
    if (!matchId) throw new Error("matchId is required");
    if (!action || typeof action !== "object") throw new Error("action is required");
    const key = matchStoreKey(matchId);
    const match = sup.chat.get(key);
    if (!match) return { ok: false, error: "match not found" };
    const res = engineApplyAction(match, sup.user, action);
    if (!res.ok) return res;
    sup.chat.set(key, res.match);
    return { ok: true };
}

// --- Deck model helpers ---

function getUserDecks() {
    const decks = sup.user.get(USER_DECKS_KEY) || [];
    return Array.isArray(decks) ? decks : [];
}

function upsertDeckForUser(deck) {
    const decks = getUserDecks();
    const now = Date.now();
    const next = sanitizeDeckForSave(deck);
    if (!next.id) { next.id = sup.uuid(); next.createdAt = now; }
    else { const existing = decks.find((d) => d.id === next.id); if (existing?.createdAt) next.createdAt = existing.createdAt; else if (!next.createdAt) next.createdAt = now; }
    next.updatedAt = now;
    const idx = decks.findIndex((d) => d.id === next.id);
    if (idx >= 0) decks[idx] = next; else decks.unshift(next);
    sup.user.set(USER_DECKS_KEY, decks);
    return next;
}

function sanitizeDeckForSave(deck) {
    const format = deck.format === "commander" ? "commander" : "standard";
    const cards = deck.cards && typeof deck.cards === "object" ? deck.cards : {};
    const cardMeta = deck.cardMeta && typeof deck.cardMeta === "object" ? deck.cardMeta : {};
    return {
        id: typeof deck.id === "string" ? deck.id : undefined,
        name: typeof deck.name === "string" ? deck.name.slice(0, 80) : "Untitled",
        format, cards: normalizeCardCounts(cards), cardMeta,
        commander: format === "commander" && typeof deck.commander === "string" ? deck.commander : null,
        commanderName: format === "commander" && typeof deck.commanderName === "string" ? deck.commanderName.slice(0, 100) : null,
        createdAt: typeof deck.createdAt === "number" ? deck.createdAt : undefined,
        updatedAt: typeof deck.updatedAt === "number" ? deck.updatedAt : undefined,
    };
}

function normalizeCardCounts(cards) {
    const out = {};
    for (const [k, v] of Object.entries(cards || {})) { if (typeof k !== "string" || !k) continue; const n = Math.floor(Number(v) || 0); if (n > 0) out[k] = n; }
    return out;
}

function deckTotalCount(deck) { return Object.values(deck.cards || {}).reduce((a, b) => a + (Number(b) || 0), 0); }

// --- Quickstart deck builders ---

function basicLandNameForColor(color) {
    const c = String(color || "").toUpperCase();
    if (c === 'W') return 'Plains'; if (c === 'U') return 'Island'; if (c === 'B') return 'Swamp';
    if (c === 'R') return 'Mountain'; if (c === 'G') return 'Forest'; return 'Wastes';
}

function getBasicLandIdByName(name) {
    const n = String(name || '').trim();
    if (!n) throw new Error('basic land name required');
    const cache = sup.global.get(BASIC_LAND_ID_CACHE_KEY) || {};
    if (cache[n]) return cache[n];
    const q = `!"${n.replaceAll('"','\\"')}" t:basic t:land`;
    const url = `${SCRYFALL.search}?q=${encodeURIComponent(q)}&order=released&unique=cards`;
    const json = scryfallFetchJsonCached(url);
    const id = json?.data?.[0]?.id;
    if (!id) throw new Error(`Could not resolve basic land: ${n}`);
    cache[n] = id;
    sup.global.set(BASIC_LAND_ID_CACHE_KEY, cache);
    return id;
}

function scryfallSearchAll(query, opts) {
    const options = opts || {};
    const order = options.order || 'name';
    const unique = options.unique || 'cards';
    const maxPages = Math.max(1, Math.min(8, Number(options.maxPages) || 4));
    const cache = sup.global.get(GLOBAL_SCRYFALL_CACHE_KEY) || {};
    let dirty = false;
    const out = [];
    for (let page = 1; page <= maxPages; page++) {
        const url = `${SCRYFALL.search}?q=${encodeURIComponent(query)}&order=${encodeURIComponent(order)}&unique=${encodeURIComponent(unique)}&page=${page}`;
        let json = scryfallCacheGet(cache, url);
        if (!json) {
            const res = sup.fetch(url, { headers: { "User-Agent": "SupMTG/0 (contact: @heyhaigh)", Accept: "application/json" } });
            json = res.json();
            scryfallCacheSet(cache, url, json);
            dirty = true;
        }
        const data = Array.isArray(json?.data) ? json.data : [];
        for (const c of data) out.push(c);
        if (!json?.has_more) break;
    }
    if (dirty) sup.global.set(GLOBAL_SCRYFALL_CACHE_KEY, cache);
    return out;
}

function buildQuickstartStandardDeck(color) {
    const c = String(color || '').toUpperCase();
    const pool = scryfallSearchAll('f:standard id=' + c + ' -t:land -type:basic', { order: 'popular', maxPages: 3 });
    const valid = pool.filter((x) => x && x.object === 'card' && x.id && x.name);
    if (valid.length < 6) throw new Error('Not enough Standard-legal cards found for this mono-color quickstart.');
    // Bucket by CMC for curve awareness
    const low = []; const mid = []; const high = [];
    for (const card of valid) {
        const cmc = Number(card.cmc) || 0;
        if (cmc <= 2) low.push(card);
        else if (cmc <= 4) mid.push(card);
        else high.push(card);
    }
    // Target 30 cards (no lands): 4 low-CMC (4x=16), 2 mid-CMC (4x=8), 2 high-CMC (3x=6) = 30
    const picks = [];
    picks.push(...low.slice(0, 4));
    picks.push(...mid.slice(0, 2));
    picks.push(...high.slice(0, 2));
    // Fill remaining unique slots if needed
    if (picks.length < 8) {
        const used = new Set(picks.map(p => p.id));
        for (const card of valid) { if (!used.has(card.id)) { picks.push(card); used.add(card.id); if (picks.length >= 8) break; } }
    }
    const cards = {}; const cardMeta = {};
    for (let i = 0; i < picks.length; i++) {
        const card = picks[i];
        // First 6 picks get 4 copies, last 2 get 3 copies = 24 + 6 = 30
        cards[card.id] = i < 6 ? 4 : 3;
        cardMeta[card.id] = { name: card.name, typeLine: card.type_line || '', cmc: Number(card.cmc) || 0, power: card.power != null ? String(card.power) : null, toughness: card.toughness != null ? String(card.toughness) : null };
    }
    const total = Object.values(cards).reduce((a, b) => a + (Number(b) || 0), 0);
    // Fill to 30 if short using extra low-CMC cards at 4 copies
    if (total < 30 && low.length > 4) {
        const used = new Set(Object.keys(cards));
        for (const card of low) {
            if (used.has(card.id)) continue;
            cards[card.id] = Math.min(4, 30 - Object.values(cards).reduce((a, b) => a + (Number(b) || 0), 0));
            cardMeta[card.id] = { name: card.name, typeLine: card.type_line || '', cmc: Number(card.cmc) || 0, power: card.power != null ? String(card.power) : null, toughness: card.toughness != null ? String(card.toughness) : null };
            if (Object.values(cards).reduce((a, b) => a + (Number(b) || 0), 0) >= 30) break;
        }
    }
    const names = { W:'Quickstart \u2014 Mono-White Aggro', U:'Quickstart \u2014 Mono-Blue Tempo', B:'Quickstart \u2014 Mono-Black Midrange', R:'Quickstart \u2014 Mono-Red Aggro', G:'Quickstart \u2014 Mono-Green Stompy' };
    return { name: names[c] || ('Quickstart \u2014 Mono-' + c), format: 'standard', cards, cardMeta, commander: null, commanderName: null };
}

function resolveCommanderByName(name) {
    const n = String(name || '').trim();
    if (!n) return null;
    const q = `!"${n.replaceAll('"','\\"')}" (t:legendary t:creature) legal:commander`;
    const url = `${SCRYFALL.search}?q=${encodeURIComponent(q)}&order=name&unique=cards&page=1`;
    const json = scryfallFetchJsonCached(url);
    return json?.data?.[0] || null;
}

function scryfallIdFilterForColors(colors) {
    const cs = Array.isArray(colors) ? colors.filter(Boolean) : [];
    if (!cs.length) return 'id=c';
    return `id<=${cs.join('')}`;
}

function cmdDeckCategorize(card) {
    const tl = String(card.type_line || '').toLowerCase();
    const ot = String(card.oracle_text || '').toLowerCase();
    if (tl.includes('land')) return 'land';
    if (/add\s+\{[wubrgc]\}|add.*mana|mana rock/i.test(ot) && (tl.includes('artifact') || tl.includes('creature') || tl.includes('enchantment'))) return 'ramp';
    if (/draw.*card|draws.*card/i.test(ot) && !tl.includes('land')) return 'draw';
    if (/destroy target|exile target|deals.*damage to.*target|return target.*to/i.test(ot) && (tl.includes('instant') || tl.includes('sorcery') || tl.includes('enchantment'))) return 'removal';
    return 'other';
}

function buildQuickstartCommanderDeck(commanderCard) {
    const cmd = commanderCard;
    const typeLine = String(cmd.type_line || '');
    const oracle = String(cmd.oracle_text || '');
    const looksLikeLegendaryCreature = typeLine.includes('Legendary') && typeLine.includes('Creature');
    const saysCanBeCommander = /can be your commander/i.test(oracle);
    if (!looksLikeLegendaryCreature && !saysCanBeCommander) throw new Error('Selected card does not appear to be a valid commander.');
    const leg = cmd.legalities || {};
    if (leg.commander !== 'legal') throw new Error(`${cmd.name} is not legal in Commander (${leg.commander || 'unknown'}).`);
    const colors = Array.isArray(cmd.color_identity) ? cmd.color_identity : [];
    const idFilter = scryfallIdFilterForColors(colors);
    const pool = scryfallSearchAll(`legal:commander ${idFilter} -t:land -type:basic`, { order: 'edhrec', maxPages: 4 });
    const valid = pool.filter(x => x && x.object === 'card' && x.id && x.id !== cmd.id);

    // Categorize pool
    const buckets = { ramp: [], draw: [], removal: [], other: [] };
    for (const c of valid) { const cat = cmdDeckCategorize(c); if (cat !== 'land') (buckets[cat] || buckets.other).push(c); }

    // Target 60 cards (no lands): commander (1) + 59 spells. ~8 ramp, ~8 draw, ~4 removal, ~39 other
    const cards = {}; const cardMeta = {};
    cards[cmd.id] = 1; cardMeta[cmd.id] = { name: cmd.name, typeLine: cmd.type_line || '', cmc: Number(cmd.cmc) || 0, power: cmd.power != null ? String(cmd.power) : null, toughness: cmd.toughness != null ? String(cmd.toughness) : null };
    const used = new Set([cmd.id]);
    const targets = { ramp: 8, draw: 8, removal: 4, other: 39 };
    const chosen = [];
    for (const [cat, target] of Object.entries(targets)) {
        const src = buckets[cat] || [];
        let picked = 0;
        for (const c of src) {
            if (used.has(c.id)) continue;
            chosen.push(c); used.add(c.id); picked++;
            if (picked >= target) break;
        }
    }
    // Fill remaining from any category up to 59 total nonland cards
    if (chosen.length < 59) {
        for (const c of valid) {
            if (used.has(c.id)) continue;
            chosen.push(c); used.add(c.id);
            if (chosen.length >= 59) break;
        }
    }
    if (chosen.length < 30) throw new Error('Not enough Commander cards found for this commander color identity.');
    for (const c of chosen) { cards[c.id] = 1; cardMeta[c.id] = { name: c.name, typeLine: c.type_line || '', cmc: Number(c.cmc) || 0, power: c.power != null ? String(c.power) : null, toughness: c.toughness != null ? String(c.toughness) : null }; }
    return { name: 'Quickstart \u2014 ' + cmd.name, format: 'commander', cards, cardMeta, commander: cmd.id, commanderName: cmd.name };
}

// --- Deck validation ---

function validateDeck(deck) {
    const errors = [];
    const n = deckTotalCount(deck);
    if (deck.format === "standard") { if (n < 30) errors.push("Standard deck must have at least 30 cards (has " + n + ")."); }
    else if (deck.format === "commander") {
        if (n !== 60) errors.push("Commander deck must have exactly 60 cards (has " + n + ").");
        if (!deck.commander) errors.push("Commander deck requires a commander.");
        if (deck.commander) { const cmdCount = Number(deck.cards?.[deck.commander] || 0); if (cmdCount !== 1) errors.push(`Commander must be included exactly once (currently ${cmdCount}).`); }
    } else errors.push("Unknown format.");
    const uniqueCardIds = Object.keys(deck.cards || {});
    if (uniqueCardIds.length > 300) errors.push("Too many unique cards in deck.");
    if (errors.length) return { ok: false, errors };
    const cardById = {};
    for (const cardId of uniqueCardIds) {
        const card = scryfallFetchJsonCached(`${SCRYFALL.card}/${encodeURIComponent(cardId)}`);
        if (!card || card.object !== "card") { errors.push(`Missing card data for ${cardId}`); continue; }
        cardById[cardId] = card;
        const leg = card.legalities || {};
        if (deck.format === "standard" && leg.standard !== "legal") errors.push(`${card.name} is not legal in Standard (${leg.standard || "unknown"}).`);
        if (deck.format === "commander" && leg.commander !== "legal") errors.push(`${card.name} is not legal in Commander (${leg.commander || "unknown"}).`);
    }
    if (deck.format === "commander" && deck.commander) {
        const cmd = cardById[deck.commander] || scryfallFetchJsonCached(`${SCRYFALL.card}/${encodeURIComponent(deck.commander)}`);
        if (!cmd || cmd.object !== "card") { errors.push("Commander card data not found."); }
        else {
            if ((cmd.legalities || {}).commander !== "legal") errors.push(`${cmd.name} is not legal in Commander.`);
            const tl = String(cmd.type_line || ""); const ot = String(cmd.oracle_text || "");
            if (!(tl.includes("Legendary") && tl.includes("Creature")) && !/can be your commander/i.test(ot)) errors.push(`${cmd.name} is not a valid commander.`);
            const commanderCI = Array.isArray(cmd.color_identity) ? cmd.color_identity : [];
            const commanderSet = new Set(commanderCI);
            for (const cardId of uniqueCardIds) {
                const card = cardById[cardId]; if (!card) continue;
                const ci = Array.isArray(card.color_identity) ? card.color_identity : [];
                for (const c of ci) { if (!commanderSet.has(c)) { errors.push(`${card.name} has color identity [${ci.join(",")}] outside commander's [${commanderCI.join(",")}].`); break; } }
            }
            for (const cardId of uniqueCardIds) {
                const card = cardById[cardId]; if (!card) continue;
                const count = Number(deck.cards?.[cardId] || 0);
                const max = commanderMaxCopiesAllowed(card);
                if (count > max) errors.push(`${card.name} has ${count} copies (max ${max} in Commander).`);
            }
        }
    }
    return { ok: errors.length === 0, errors };
}

function commanderMaxCopiesAllowed(card) {
    if (!card || typeof card !== "object") return 1;
    const typeLine = String(card.type_line || ""); const oracle = String(card.oracle_text || "");
    if (/\bBasic\b/i.test(typeLine) && /\bLand\b/i.test(typeLine)) return Number.POSITIVE_INFINITY;
    if (/A deck can have any number of cards named/i.test(oracle)) return Number.POSITIVE_INFINITY;
    const m = oracle.match(/A deck can have up to\s+([A-Za-z0-9-]+)\s+cards named/i);
    if (m) { const n = parseCardCountWordOrNumber(m[1]); if (Number.isFinite(n) && n > 0) return n; }
    return 1;
}

function parseCardCountWordOrNumber(s) {
    const raw = String(s || "").trim().toLowerCase();
    const asNum = Number(raw); if (Number.isFinite(asNum) && asNum > 0) return asNum;
    const map = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10 };
    return map[raw] || NaN;
}

// --- Match + engine ---

function matchStoreKey(matchId) { return `mtg.match.${matchId}`; }
function botDifficultyNormalize(x) { const d = String(x || "").trim().toLowerCase(); if (d === "medium" || d === "hard") return d; return "easy"; }
function matchHasBot(match) { return !!(match?.players || []).find((p) => p && p.isBot); }

function createInitialMatchState({ matchId, format, hostUser, hostDeck, opponentType, botDifficulty }) {
    const now = Date.now();
    const match = {
        v: 1, matchId, format, createdAt: now, phase: "lobby",
        hostUserId: hostUser.id, readyByUserId: { [hostUser.id]: false },
        players: [{ userId: hostUser.id, username: hostUser.username, joinedAt: now, seat: 1 }],
        game: { turn: 0, activePlayerSeat: 1, prioritySeat: 1, step: "main1", stack: [], zones: {}, lifeBySeat: {}, manaBySeat: {}, mulligansBySeat: {}, keptBySeat: {}, cardState: {}, combat: null },
        decks: { 1: { deckId: hostDeck.id, format: hostDeck.format, name: hostDeck.name, commander: hostDeck.commander, cards: hostDeck.cards, cardMeta: hostDeck.cardMeta || {} } },
        botsBySeat: {},
        log: [{ t: now, type: "MATCH_CREATED", by: hostUser.username, opponentType: opponentType || "human" }],
    };
    if (format === "standard" && opponentType === "bot") {
        const botId = `bot:${matchId}`;
        match.players.push({ userId: botId, username: "MTG Bot", joinedAt: now, seat: 2, isBot: true, difficulty: botDifficultyNormalize(botDifficulty) });
        match.readyByUserId[botId] = true;
        match.botsBySeat[2] = { difficulty: botDifficultyNormalize(botDifficulty) };
        match.decks[2] = { deckId: hostDeck.id, format: hostDeck.format, name: `${hostDeck.name} (Bot)`, commander: hostDeck.commander, cards: hostDeck.cards, cardMeta: hostDeck.cardMeta || {} };
        match.log.push({ t: now, type: "BOT_ADDED", by: "engine", seat: 2, difficulty: botDifficultyNormalize(botDifficulty) });
    }
    return match;
}

function engineApplyAction(match, user, action) {
    const player = match.players.find((p) => p.userId === user.id);
    if (!player) return { ok: false, error: "user not in match" };

    if (action.type === "ASSIGN_DECK") {
        if (match.phase !== "lobby") return { ok: false, error: "can only assign deck in lobby" };
        const deckId = action.deckId; if (!deckId) return { ok: false, error: "deckId is required" };
        const deck = getUserDecks().find((d) => d.id === deckId);
        if (!deck) return { ok: false, error: "deck not found" };
        if (deck.format !== match.format) return { ok: false, error: "deck format mismatch" };
        const v = validateDeck(deck); if (!v.ok) return { ok: false, error: "invalid deck", errors: v.errors };
        match.decks[player.seat] = { deckId: deck.id, format: deck.format, name: deck.name, commander: deck.commander, cards: deck.cards, cardMeta: deck.cardMeta || {} };
        match.log.push({ t: Date.now(), type: "DECK_ASSIGNED", by: user.username, seat: player.seat, deckId: deck.id });
        return { ok: true, match };
    }

    if (action.type === "SET_READY") {
        if (!match.readyByUserId) match.readyByUserId = {};
        match.readyByUserId[user.id] = !!action.ready;
        match.log.push({ t: Date.now(), type: "READY", by: user.username, ready: !!action.ready });
        return { ok: true, match };
    }

    if (action.type === "START_GAME") {
        if (match.phase !== "lobby") return { ok: false, error: "match already started" };
        if (match.hostUserId !== user.id) return { ok: false, error: "only host can start" };
        const readyBy = match.readyByUserId || {};
        for (const p of match.players) {
            if (!match.decks || !match.decks[p.seat]) return { ok: false, error: `seat ${p.seat} missing deck` };
            if (!readyBy[p.userId]) return { ok: false, error: `@${p.username} is not ready` };
        }
        if (match.format === "standard" && match.players.length !== 2) return { ok: false, error: "Standard requires exactly 2 players" };
        if (match.format === "commander") { if (match.players.length < 2) return { ok: false, error: "Commander requires at least 2 players" }; if (match.players.length > 5) return { ok: false, error: "Commander supports up to 5 players (v1)" }; }
        if (!match.game) match.game = { zones: {} }; if (!match.game.zones) match.game.zones = {}; if (!match.game.lifeBySeat) match.game.lifeBySeat = {};
        match.game.mulligansBySeat = {}; match.game.keptBySeat = {};
        for (const p of match.players) {
            const seat = p.seat; const deck = match.decks[seat];
            if (!deck) return { ok: false, error: `seat ${seat} missing deck` };
            const expanded = expandDeckToList(deck.cards);
            const commanderId = match.format === "commander" ? deck.commander : null;
            const library = commanderId ? expanded.filter((id) => id !== commanderId) : expanded.slice();
            shuffleInPlace(library);
            const hand = []; for (let i = 0; i < 7; i++) { const top = library.shift(); if (!top) break; hand.push(top); }
            match.game.zones[seat] = { library, hand, graveyard: [], exile: [], battlefield: [], command: commanderId ? [commanderId] : [] };
            match.game.lifeBySeat[seat] = match.format === "commander" ? 40 : 20;
            if (!match.game.manaBySeat) match.game.manaBySeat = {};
            match.game.manaBySeat[seat] = { current: 0, max: 0 };
            match.game.mulligansBySeat[seat] = 0; match.game.keptBySeat[seat] = false;
            if (p.isBot) match.game.keptBySeat[seat] = true;
        }
        match.phase = "mulligan"; match.game.turn = 1; match.game.step = "mulligan";
        match.log.push({ t: Date.now(), type: "GAME_START", by: user.username });
        return { ok: true, match };
    }

    if (action.type === "MULLIGAN") {
        if (match.phase !== "mulligan") return { ok: false, error: "can only mulligan during mulligan phase" };
        const seat = player.seat; const zones = match.game?.zones?.[seat];
        if (!zones) return { ok: false, error: "zones not initialized" };
        if (match.game.keptBySeat?.[seat]) return { ok: false, error: "already kept" };
        const taken = Number(match.game.mulligansBySeat?.[seat] || 0);
        const nextTaken = Math.min(6, taken + 1);
        zones.library = zones.library.concat(zones.hand || []); zones.hand = [];
        shuffleInPlace(zones.library);
        const drawN = Math.max(1, 7 - nextTaken);
        for (let i = 0; i < drawN; i++) { const top = zones.library.shift(); if (!top) break; zones.hand.push(top); }
        match.game.mulligansBySeat[seat] = nextTaken;
        match.log.push({ t: Date.now(), type: "MULLIGAN", by: user.username, seat, handSize: drawN });
        return { ok: true, match };
    }

    if (action.type === "KEEP_HAND") {
        if (match.phase !== "mulligan") return { ok: false, error: "can only keep during mulligan phase" };
        const seat = player.seat;
        if (!match.game.keptBySeat) match.game.keptBySeat = {};
        match.game.keptBySeat[seat] = true;
        match.log.push({ t: Date.now(), type: "KEEP_HAND", by: user.username, seat });
        const allKept = match.players.every((p) => !!match.game.keptBySeat[p.seat]);
        if (allKept) {
            match.phase = "playing"; match.game.step = "main1";
            let startSeat = 1;
            if (matchHasBot(match) && match.players.length === 2) { const human = match.players.find((p) => !p.isBot); startSeat = human?.seat || 1; }
            else { const seats = match.players.map((p) => p.seat); startSeat = seats[sup.random.integer(0, Math.max(0, seats.length - 1))] || 1; }
            match.game.activePlayerSeat = startSeat; match.game.prioritySeat = startSeat;
            if (!match.game.manaBySeat) match.game.manaBySeat = {};
            if (!match.game.manaBySeat[startSeat]) match.game.manaBySeat[startSeat] = { current: 0, max: 0 };
            match.game.manaBySeat[startSeat].max = 1; match.game.manaBySeat[startSeat].current = 1;
            match.log.push({ t: Date.now(), type: "MULLIGANS_DONE", by: "engine" });
            match.log.push({ t: Date.now(), type: "TURN_START", by: "engine", turn: match.game.turn, seat: startSeat });
            engineRunBotsIfActive(match);
        }
        return { ok: true, match };
    }

    if (action.type === "PLAY_FROM_HAND") {
        if (match.phase !== "playing") return { ok: false, error: "can only play during playing phase" };
        const seat = player.seat;
        if (match.game?.activePlayerSeat != null && seat !== match.game.activePlayerSeat) return { ok: false, error: "not your turn" };
        if (match.game.step !== "main1" && match.game.step !== "main2") return { ok: false, error: "can only play cards during a main phase" };
        const cardId = action.cardId; if (!cardId) return { ok: false, error: "cardId is required" };
        const deckMeta = match.decks?.[seat]?.cardMeta || {};
        const cmc = Number(deckMeta[cardId]?.cmc) || 0;
        const mana = match.game.manaBySeat?.[seat] || { current: 0, max: 0 };
        if (cmc > mana.current) return { ok: false, error: "not enough mana (" + cmc + " needed, " + mana.current + " available)" };
        var isSpell = engineIsSpell(match, seat, cardId);
        const ok = enginePlayCard(match, seat, cardId); if (!ok.ok) return ok;
        mana.current = Math.max(0, mana.current - cmc);
        match.log.push({ t: Date.now(), type: isSpell ? "CAST_SPELL" : "PLAY", by: user.username, seat, cardId });
        return { ok: true, match };
    }

    if (action.type === "MOVE_BATTLEFIELD_TO_GRAVEYARD") {
        if (match.phase !== "playing") return { ok: false, error: "can only move during playing phase" };
        const seat = player.seat;
        if (match.game?.activePlayerSeat != null && seat !== match.game.activePlayerSeat) return { ok: false, error: "not your turn" };
        if (match.game.step !== "main1" && match.game.step !== "main2") return { ok: false, error: "can only move cards during a main phase" };
        const cardId = action.cardId; if (!cardId) return { ok: false, error: "cardId is required" };
        const ok = engineMoveCard(match, seat, "battlefield", "graveyard", cardId); if (!ok.ok) return ok;
        match.log.push({ t: Date.now(), type: "MOVE_TO_GY", by: user.username, seat, cardId });
        return { ok: true, match };
    }

    if (action.type === "END_TURN") {
        if (match.phase !== "playing") return { ok: false, error: "can only end turn during playing phase" };
        const seat = player.seat;
        if (match.game?.activePlayerSeat != null && seat !== match.game.activePlayerSeat) return { ok: false, error: "not your turn" };
        if (match.game.step !== "main1" && match.game.step !== "main2") return { ok: false, error: "can only end turn during a main phase" };
        engineAdvanceTurn(match, { by: user.username }); engineRunBotsIfActive(match);
        return { ok: true, match };
    }

    if (action.type === "DRAW") {
        const seat = player.seat; engineEnsureZones(match, seat);
        if (match.game.zones[seat].library.length === 0) {
            const deck = match.decks[seat]; if (!deck) return { ok: false, error: "no deck assigned" };
            const expanded = expandDeckToList(deck.cards);
            const commanderId = match.format === "commander" ? deck.commander : null;
            const library = commanderId ? expanded.filter((id) => id !== commanderId) : expanded.slice();
            shuffleInPlace(library); match.game.zones[seat].library = library;
            if (commanderId && (!match.game.zones[seat].command || match.game.zones[seat].command.length === 0)) match.game.zones[seat].command = [commanderId];
        }
        engineDrawCards(match, seat, Math.max(1, Math.min(7, Number(action.n) || 1)));
        match.log.push({ t: Date.now(), type: "DRAW", by: user.username, n: Math.max(1, Math.min(7, Number(action.n) || 1)) });
        return { ok: true, match };
    }

    if (action.type === "GO_TO_COMBAT") {
        if (match.phase !== "playing") return { ok: false, error: "not in playing phase" };
        var seat = player.seat;
        if (match.game?.activePlayerSeat != null && seat !== match.game.activePlayerSeat) return { ok: false, error: "not your turn" };
        if (match.game.step !== "main1") return { ok: false, error: "can only go to combat from main phase 1" };
        match.game.step = "combat_attackers";
        match.game.combat = { attackers: {}, blockers: {}, resolved: false };
        match.log.push({ t: Date.now(), type: "COMBAT_BEGIN", by: user.username, seat: seat });
        return { ok: true, match };
    }

    if (action.type === "DECLARE_ATTACKERS") {
        if (match.phase !== "playing") return { ok: false, error: "not in playing phase" };
        var seat = player.seat;
        if (match.game?.activePlayerSeat != null && seat !== match.game.activePlayerSeat) return { ok: false, error: "not your turn" };
        if (match.game.step !== "combat_attackers") return { ok: false, error: "not in attacker declaration step" };
        var attackers = action.attackers || {};
        if (!match.game.combat) match.game.combat = { attackers: {}, blockers: {}, resolved: false };
        if (!match.game.cardState) match.game.cardState = {};
        engineEnsureZones(match, seat);
        var myBf = match.game.zones[seat].battlefield;
        var attackerIds = Object.keys(attackers);
        for (var ai = 0; ai < attackerIds.length; ai++) {
            var cid = attackerIds[ai];
            if (myBf.indexOf(cid) < 0) return { ok: false, error: "card " + cid + " not on your battlefield" };
            if (!engineIsCreature(match, seat, cid)) return { ok: false, error: "card " + cid + " is not a creature" };
            var cs = match.game.cardState[cid];
            if (cs && cs.tapped) return { ok: false, error: "card " + cid + " is tapped" };
            if (cs && cs.summoningSick) return { ok: false, error: "card " + cid + " has summoning sickness" };
            var targetSeat = attackers[cid];
            if (targetSeat === seat) return { ok: false, error: "cannot attack yourself" };
            var validSeats = engineSeatOrder(match);
            if (validSeats.indexOf(Number(targetSeat)) < 0) return { ok: false, error: "invalid target seat " + targetSeat };
        }
        // Store attackers and tap them
        match.game.combat.attackers = {};
        for (var ai2 = 0; ai2 < attackerIds.length; ai2++) {
            var cid2 = attackerIds[ai2];
            match.game.combat.attackers[cid2] = attackers[cid2];
            if (!match.game.cardState[cid2]) match.game.cardState[cid2] = { tapped: false, summoningSick: false, damage: 0 };
            match.game.cardState[cid2].tapped = true;
        }
        match.log.push({ t: Date.now(), type: "ATTACKERS_DECLARED", by: user.username, seat: seat, count: attackerIds.length });
        // Determine defenders
        var defenderSeats = {};
        for (var ak in match.game.combat.attackers) { defenderSeats[match.game.combat.attackers[ak]] = true; }
        var hasHumanDefender = false;
        var humanDefenderSeat = null;
        for (var ds in defenderSeats) {
            var defPlayer = (match.players || []).find(function(p) { return p.seat === Number(ds); });
            if (defPlayer && !defPlayer.isBot) { hasHumanDefender = true; humanDefenderSeat = Number(ds); }
        }
        if (!hasHumanDefender) {
            // All defenders are bots — auto-block and resolve
            for (var ds2 in defenderSeats) {
                var botDef = (match.players || []).find(function(p) { return p.seat === Number(ds2) && p.isBot; });
                if (botDef) engineBotDeclareBlockers(match, botDef);
            }
            engineResolveCombatDamage(match);
            match.game.step = "main2";
        } else {
            // Human defender — wait for blocks
            match.game.step = "combat_blockers";
            match.game.prioritySeat = humanDefenderSeat;
        }
        return { ok: true, match };
    }

    if (action.type === "SKIP_COMBAT") {
        if (match.phase !== "playing") return { ok: false, error: "not in playing phase" };
        var seat = player.seat;
        if (match.game?.activePlayerSeat != null && seat !== match.game.activePlayerSeat) return { ok: false, error: "not your turn" };
        if (match.game.step !== "combat_attackers") return { ok: false, error: "not in attacker declaration step" };
        match.game.step = "main2";
        match.game.combat = null;
        match.log.push({ t: Date.now(), type: "COMBAT_SKIPPED", by: user.username, seat: seat });
        return { ok: true, match };
    }

    if (action.type === "DECLARE_BLOCKERS") {
        if (match.phase !== "playing") return { ok: false, error: "not in playing phase" };
        if (match.game.step !== "combat_blockers") return { ok: false, error: "not in blocker declaration step" };
        var seat = player.seat;
        if (match.game.prioritySeat != null && seat !== match.game.prioritySeat) return { ok: false, error: "not your priority to declare blockers" };
        if (!match.game.combat) return { ok: false, error: "no combat in progress" };
        var blockerMap = action.blockers || {};
        if (!match.game.cardState) match.game.cardState = {};
        engineEnsureZones(match, seat);
        var myBf2 = match.game.zones[seat].battlefield;
        var usedBlockers = {};
        var blockerKeys = Object.keys(blockerMap);
        for (var bi = 0; bi < blockerKeys.length; bi++) {
            var attackerId = blockerKeys[bi];
            var blockerId = blockerMap[attackerId];
            // Validate attacker is targeting this seat
            if (!match.game.combat.attackers[attackerId] || Number(match.game.combat.attackers[attackerId]) !== seat) {
                return { ok: false, error: "attacker " + attackerId + " is not attacking you" };
            }
            // Validate blocker on our BF
            if (myBf2.indexOf(blockerId) < 0) return { ok: false, error: "blocker " + blockerId + " not on your battlefield" };
            if (!engineIsCreature(match, seat, blockerId)) return { ok: false, error: "blocker " + blockerId + " is not a creature" };
            var bcs = match.game.cardState[blockerId];
            if (bcs && bcs.tapped) return { ok: false, error: "blocker " + blockerId + " is tapped" };
            if (usedBlockers[blockerId]) return { ok: false, error: "blocker " + blockerId + " already assigned" };
            usedBlockers[blockerId] = true;
        }
        // Store blockers
        for (var bi2 = 0; bi2 < blockerKeys.length; bi2++) {
            match.game.combat.blockers[blockerKeys[bi2]] = blockerMap[blockerKeys[bi2]];
        }
        match.log.push({ t: Date.now(), type: "BLOCKERS_DECLARED", by: user.username, seat: seat, count: blockerKeys.length });
        engineResolveCombatDamage(match);
        // Check if active player is bot (bot was attacking)
        var activePlayer2 = (match.players || []).find(function(p) { return p.seat === match.game.activePlayerSeat; });
        if (activePlayer2 && activePlayer2.isBot) {
            engineAdvanceTurn(match, { by: "bot" });
            engineRunBotsIfActive(match);
        } else {
            match.game.step = "main2";
            match.game.prioritySeat = match.game.activePlayerSeat;
        }
        return { ok: true, match };
    }

    if (action.type === "NO_BLOCKS") {
        if (match.phase !== "playing") return { ok: false, error: "not in playing phase" };
        if (match.game.step !== "combat_blockers") return { ok: false, error: "not in blocker declaration step" };
        var seat = player.seat;
        if (match.game.prioritySeat != null && seat !== match.game.prioritySeat) return { ok: false, error: "not your priority to declare blockers" };
        if (!match.game.combat) return { ok: false, error: "no combat in progress" };
        match.log.push({ t: Date.now(), type: "BLOCKERS_DECLARED", by: user.username, seat: seat, count: 0 });
        engineResolveCombatDamage(match);
        var activePlayer3 = (match.players || []).find(function(p) { return p.seat === match.game.activePlayerSeat; });
        if (activePlayer3 && activePlayer3.isBot) {
            engineAdvanceTurn(match, { by: "bot" });
            engineRunBotsIfActive(match);
        } else {
            match.game.step = "main2";
            match.game.prioritySeat = match.game.activePlayerSeat;
        }
        return { ok: true, match };
    }

    return { ok: false, error: "action not implemented" };
}

function engineEnsureZones(match, seat) {
    if (!match.game) match.game = { zones: {} }; if (!match.game.zones) match.game.zones = {};
    if (!match.game.zones[seat]) match.game.zones[seat] = { library: [], hand: [], graveyard: [], exile: [], battlefield: [], command: [] };
}

function engineDrawCards(match, seat, n) {
    engineEnsureZones(match, seat); const zones = match.game.zones[seat];
    for (let i = 0; i < Math.max(0, Math.min(7, Number(n) || 0)); i++) { const top = zones.library.shift(); if (!top) break; zones.hand.push(top); }
}

function engineMoveCard(match, seat, fromZone, toZone, cardId) {
    engineEnsureZones(match, seat); const zones = match.game.zones[seat];
    const from = zones[fromZone]; const to = zones[toZone];
    if (!Array.isArray(from)) return { ok: false, error: `zone ${fromZone} not available` };
    if (!Array.isArray(to)) return { ok: false, error: `zone ${toZone} not available` };
    const idx = from.indexOf(cardId); if (idx < 0) return { ok: false, error: `card not in ${fromZone}` };
    from.splice(idx, 1); to.push(cardId);
    if (fromZone === "battlefield" && match.game.cardState?.[cardId]) { delete match.game.cardState[cardId]; }
    return { ok: true };
}

function engineSeatOrder(match) { return (match.players || []).map((p) => p.seat).filter((n) => Number.isFinite(n)).sort((a, b) => a - b); }

function engineNextSeat(match, currentSeat) {
    const seats = engineSeatOrder(match); if (!seats.length) return 1;
    const idx = seats.indexOf(Number(currentSeat) || seats[0]);
    return seats[(idx < 0 ? 0 : idx + 1) % seats.length];
}

function engineAdvanceTurn(match, opts) {
    const cur = match.game?.activePlayerSeat || 1;
    const next = engineNextSeat(match, cur);
    if (next <= cur) match.game.turn = (Number(match.game.turn) || 1) + 1;
    match.game.activePlayerSeat = next; match.game.prioritySeat = next;
    match.game.step = "main1";
    if (!match.game.manaBySeat) match.game.manaBySeat = {};
    const mana = match.game.manaBySeat[next] || { current: 0, max: 0 };
    mana.max = Math.min(10, mana.max + 1);
    mana.current = mana.max;
    match.game.manaBySeat[next] = mana;
    engineEnsureZones(match, next); engineDrawCards(match, next, 1);
    if (!match.game.cardState) match.game.cardState = {};
    // Clear summoning sickness for incoming player
    var bf = match.game.zones?.[next]?.battlefield || [];
    for (var ci = 0; ci < bf.length; ci++) { if (match.game.cardState[bf[ci]]) match.game.cardState[bf[ci]].summoningSick = false; }
    // Untap all permanents for incoming player
    for (var ui = 0; ui < bf.length; ui++) { if (match.game.cardState[bf[ui]]) match.game.cardState[bf[ui]].tapped = false; }
    // Clear combat damage from ALL creatures across ALL seats
    var allSeats = engineSeatOrder(match);
    for (var si = 0; si < allSeats.length; si++) {
        var sBf = match.game.zones?.[allSeats[si]]?.battlefield || [];
        for (var di = 0; di < sBf.length; di++) { if (match.game.cardState[sBf[di]]) match.game.cardState[sBf[di]].damage = 0; }
    }
    // Clear combat state
    match.game.combat = null;
    match.log.push({ t: Date.now(), type: "TURN_START", by: (opts || {}).by || "engine", turn: match.game.turn, seat: next });
}

function engineRunBotsIfActive(match) {
    let guard = 0;
    while (guard++ < 6) {
        const botPlayer = (match.players || []).find((p) => p.isBot && p.seat === match.game?.activePlayerSeat);
        if (!botPlayer) break;
        engineBotTakeTurn(match, botPlayer);
    }
}

function engineGetCreaturePower(match, seat, cardId) {
    return Number((match.decks?.[seat]?.cardMeta || {})[cardId]?.power) || 0;
}
function engineGetCreatureToughness(match, seat, cardId) {
    return Number((match.decks?.[seat]?.cardMeta || {})[cardId]?.toughness) || 0;
}

function engineFindSeatForCard(match, cardId) {
    var seats = engineSeatOrder(match);
    for (var i = 0; i < seats.length; i++) {
        var bf = match.game.zones?.[seats[i]]?.battlefield || [];
        if (bf.indexOf(cardId) >= 0) return seats[i];
    }
    return null;
}

function engineResolveCombatDamage(match) {
    if (!match.game.combat) return;
    var attackers = match.game.combat.attackers || {};
    var blockers = match.game.combat.blockers || {};
    if (!match.game.cardState) match.game.cardState = {};
    if (!match.game.lifeBySeat) match.game.lifeBySeat = {};
    var attackerIds = Object.keys(attackers);
    for (var i = 0; i < attackerIds.length; i++) {
        var atkId = attackerIds[i];
        var defSeat = Number(attackers[atkId]);
        var atkSeat = engineFindSeatForCard(match, atkId);
        if (!atkSeat) continue;
        var atkPower = engineGetCreaturePower(match, atkSeat, atkId);
        var blockerId = blockers[atkId];
        if (blockerId) {
            // Blocked — simultaneous damage
            var blkSeat = engineFindSeatForCard(match, blockerId);
            if (!blkSeat) continue;
            var blkPower = engineGetCreaturePower(match, blkSeat, blockerId);
            var blkToughness = engineGetCreatureToughness(match, blkSeat, blockerId);
            var atkToughness = engineGetCreatureToughness(match, atkSeat, atkId);
            if (!match.game.cardState[atkId]) match.game.cardState[atkId] = { tapped: false, summoningSick: false, damage: 0 };
            if (!match.game.cardState[blockerId]) match.game.cardState[blockerId] = { tapped: false, summoningSick: false, damage: 0 };
            match.game.cardState[atkId].damage = (Number(match.game.cardState[atkId].damage) || 0) + blkPower;
            match.game.cardState[blockerId].damage = (Number(match.game.cardState[blockerId].damage) || 0) + atkPower;
            match.log.push({ t: Date.now(), type: "COMBAT_DAMAGE", atk: atkId, blk: blockerId, atkDmg: blkPower, blkDmg: atkPower });
        } else {
            // Unblocked — damage to player
            if (match.game.lifeBySeat[defSeat] != null) {
                match.game.lifeBySeat[defSeat] = Math.max(0, match.game.lifeBySeat[defSeat] - atkPower);
            }
            match.log.push({ t: Date.now(), type: "PLAYER_DAMAGE", seat: defSeat, damage: atkPower, by: atkId });
        }
    }
    engineCheckLethalDamage(match);
    match.game.combat.resolved = true;
    match.log.push({ t: Date.now(), type: "COMBAT_RESOLVED" });
}

function engineCheckLethalDamage(match) {
    if (!match.game.cardState) return;
    var allSeats = engineSeatOrder(match);
    for (var si = 0; si < allSeats.length; si++) {
        var seat = allSeats[si];
        engineEnsureZones(match, seat);
        var bf = match.game.zones[seat].battlefield;
        // Iterate backwards since we may remove elements
        for (var ci = bf.length - 1; ci >= 0; ci--) {
            var cid = bf[ci];
            if (!engineIsCreature(match, seat, cid)) continue;
            var cs = match.game.cardState[cid];
            if (!cs) continue;
            var dmg = Number(cs.damage) || 0;
            var tough = engineGetCreatureToughness(match, seat, cid);
            if (dmg >= tough && tough > 0) {
                engineMoveCard(match, seat, "battlefield", "graveyard", cid);
                match.log.push({ t: Date.now(), type: "CREATURE_DIED", seat: seat, cardId: cid, damage: dmg, toughness: tough });
            }
        }
    }
}

function engineBotCardMeta(match, seat, cardId) {
    return (match.decks?.[seat]?.cardMeta || {})[cardId] || {};
}

function engineBotIsLand(match, seat, cardId) {
    const tl = String(engineBotCardMeta(match, seat, cardId).typeLine || "").toLowerCase();
    return tl.includes("land");
}

function engineCardType(match, seat, cardId) {
    const tl = String((match.decks?.[seat]?.cardMeta || {})[cardId]?.typeLine || "").toLowerCase();
    if (tl.includes("creature")) return "creature";
    if (tl.includes("instant")) return "instant";
    if (tl.includes("sorcery")) return "sorcery";
    if (tl.includes("enchantment")) return "enchantment";
    if (tl.includes("artifact")) return "artifact";
    if (tl.includes("land")) return "land";
    return "unknown";
}
function engineIsSpell(match, seat, cardId) { var t = engineCardType(match, seat, cardId); return t === "instant" || t === "sorcery"; }
function engineIsCreature(match, seat, cardId) { return engineCardType(match, seat, cardId) === "creature"; }

function enginePlayCard(match, seat, cardId) {
    if (engineIsSpell(match, seat, cardId)) {
        return engineMoveCard(match, seat, "hand", "graveyard", cardId);
    }
    var result = engineMoveCard(match, seat, "hand", "battlefield", cardId);
    if (result.ok && engineIsCreature(match, seat, cardId)) {
        if (!match.game.cardState) match.game.cardState = {};
        match.game.cardState[cardId] = { tapped: false, summoningSick: true, damage: 0 };
    }
    return result;
}

function engineBotTakeTurn(match, botPlayer) {
    const seat = botPlayer.seat; const diff = botDifficultyNormalize(botPlayer.difficulty);
    engineEnsureZones(match, seat);
    const hand = Array.isArray(match.game.zones[seat].hand) ? match.game.zones[seat].hand : [];
    const bf = Array.isArray(match.game.zones[seat].battlefield) ? match.game.zones[seat].battlefield : [];
    const played = [];
    if (!match.game.manaBySeat) match.game.manaBySeat = {};
    const mana = match.game.manaBySeat[seat] || { current: 0, max: 0 };
    match.game.manaBySeat[seat] = mana;

    const getCmc = (id) => Number(engineBotCardMeta(match, seat, id).cmc) || 0;
    const affordable = hand.filter(id => getCmc(id) <= mana.current);

    if (!affordable.length || (diff === "easy" && sup.random.integer(0, 4) < 2)) {
        match.log.push({ t: Date.now(), type: "BOT_PASS", by: "bot", seat, difficulty: diff });
        engineAdvanceTurn(match, { by: "bot" });
        return;
    }

    if (diff === "easy") {
        // Easy: play 1 random affordable card
        const idx = sup.random.integer(0, affordable.length - 1);
        const cardId = affordable[idx];
        enginePlayCard(match, seat, cardId);
        mana.current = Math.max(0, mana.current - getCmc(cardId));
        played.push(cardId);
    } else if (diff === "medium") {
        // Medium: sort affordable by CMC ascending, play greedily (cheapest first)
        const sorted = affordable.slice().sort((a, b) => getCmc(a) - getCmc(b));
        for (const cardId of sorted) {
            if (getCmc(cardId) > mana.current) continue;
            enginePlayCard(match, seat, cardId);
            mana.current = Math.max(0, mana.current - getCmc(cardId));
            played.push(cardId);
        }
    } else {
        // Hard: sort affordable by CMC descending (value maximization), cap board at 6
        const sorted = affordable.slice().sort((a, b) => getCmc(b) - getCmc(a));
        for (const cardId of sorted) {
            if (getCmc(cardId) > mana.current) continue;
            if (bf.length + played.length >= 6) break;
            enginePlayCard(match, seat, cardId);
            mana.current = Math.max(0, mana.current - getCmc(cardId));
            played.push(cardId);
        }
    }

    if (played.length) {
        for (const cardId of played) {
            var logType = engineIsSpell(match, seat, cardId) ? "BOT_CAST_SPELL" : "BOT_PLAY";
            match.log.push({ t: Date.now(), type: logType, by: "bot", seat, difficulty: diff, cardId });
        }
    } else {
        match.log.push({ t: Date.now(), type: "BOT_PASS", by: "bot", seat, difficulty: diff });
    }
    // Bot combat phase
    var didAttack = engineBotDeclareAttackers(match, botPlayer);
    if (didAttack) {
        // Find defenders
        var combatDefSeats = {};
        for (var ck in match.game.combat.attackers) { combatDefSeats[match.game.combat.attackers[ck]] = true; }
        var botHasHumanDefender = false;
        var botHumanDefSeat = null;
        for (var cds in combatDefSeats) {
            var cdsPlayer = (match.players || []).find(function(p) { return p.seat === Number(cds); });
            if (cdsPlayer && !cdsPlayer.isBot) { botHasHumanDefender = true; botHumanDefSeat = Number(cds); }
        }
        if (botHasHumanDefender) {
            // Pause for human to declare blockers
            match.game.step = "combat_blockers";
            match.game.prioritySeat = botHumanDefSeat;
            return; // Don't advance turn — wait for human
        } else {
            // All bot defenders — auto-block and resolve
            for (var cds2 in combatDefSeats) {
                var botDef2 = (match.players || []).find(function(p) { return p.seat === Number(cds2) && p.isBot; });
                if (botDef2) engineBotDeclareBlockers(match, botDef2);
            }
            engineResolveCombatDamage(match);
        }
    }
    engineAdvanceTurn(match, { by: "bot" });
}

function engineBotDeclareAttackers(match, botPlayer) {
    var seat = botPlayer.seat;
    var diff = botDifficultyNormalize(botPlayer.difficulty);
    engineEnsureZones(match, seat);
    if (!match.game.cardState) match.game.cardState = {};
    var bf = match.game.zones[seat].battlefield;
    var eligible = [];
    for (var i = 0; i < bf.length; i++) {
        var cid = bf[i];
        if (!engineIsCreature(match, seat, cid)) continue;
        var cs = match.game.cardState[cid];
        if (cs && cs.tapped) continue;
        if (cs && cs.summoningSick) continue;
        eligible.push(cid);
    }
    if (!eligible.length) return false;
    // Find a target seat (first opponent)
    var allSeats = engineSeatOrder(match);
    var targetSeat = null;
    for (var si = 0; si < allSeats.length; si++) {
        if (allSeats[si] !== seat) { targetSeat = allSeats[si]; break; }
    }
    if (!targetSeat) return false;
    var chosen = [];
    if (diff === "easy") {
        // Easy: attack with everything
        chosen = eligible.slice();
    } else if (diff === "medium") {
        // Medium: attack only if board advantage
        var oppBf = match.game.zones?.[targetSeat]?.battlefield || [];
        var oppCreatureCount = 0;
        for (var oi = 0; oi < oppBf.length; oi++) { if (engineIsCreature(match, targetSeat, oppBf[oi])) oppCreatureCount++; }
        if (eligible.length > oppCreatureCount) {
            chosen = eligible.slice();
        } else {
            // Compute total power
            var myPower = 0; var oppPower = 0;
            for (var ei = 0; ei < eligible.length; ei++) { myPower += engineGetCreaturePower(match, seat, eligible[ei]); }
            for (var oi2 = 0; oi2 < oppBf.length; oi2++) { if (engineIsCreature(match, targetSeat, oppBf[oi2])) oppPower += engineGetCreaturePower(match, targetSeat, oppBf[oi2]); }
            if (myPower > oppPower) chosen = eligible.slice();
        }
    } else {
        // Hard: only attack with creatures that have 3+ power, or if they survive/trade favorably
        var oppBf2 = match.game.zones?.[targetSeat]?.battlefield || [];
        var oppMaxToughness = 0;
        for (var oi3 = 0; oi3 < oppBf2.length; oi3++) {
            if (engineIsCreature(match, targetSeat, oppBf2[oi3])) {
                var ot = engineGetCreatureToughness(match, targetSeat, oppBf2[oi3]);
                if (ot > oppMaxToughness) oppMaxToughness = ot;
            }
        }
        for (var ei2 = 0; ei2 < eligible.length; ei2++) {
            var pw = engineGetCreaturePower(match, seat, eligible[ei2]);
            var tw = engineGetCreatureToughness(match, seat, eligible[ei2]);
            if (pw >= 3 || pw >= oppMaxToughness || tw > oppMaxToughness) {
                chosen.push(eligible[ei2]);
            }
        }
    }
    if (!chosen.length) return false;
    // Set up combat
    match.game.combat = { attackers: {}, blockers: {}, resolved: false };
    for (var ci = 0; ci < chosen.length; ci++) {
        match.game.combat.attackers[chosen[ci]] = targetSeat;
        if (!match.game.cardState[chosen[ci]]) match.game.cardState[chosen[ci]] = { tapped: false, summoningSick: false, damage: 0 };
        match.game.cardState[chosen[ci]].tapped = true;
    }
    match.game.step = "combat_attackers";
    match.log.push({ t: Date.now(), type: "ATTACKERS_DECLARED", by: "bot", seat: seat, count: chosen.length });
    return true;
}

function engineBotDeclareBlockers(match, botPlayer) {
    var seat = botPlayer.seat;
    var diff = botDifficultyNormalize(botPlayer.difficulty);
    engineEnsureZones(match, seat);
    if (!match.game.combat) return;
    if (!match.game.cardState) match.game.cardState = {};
    var bf = match.game.zones[seat].battlefield;
    // Find eligible blockers (untapped creatures)
    var eligibleBlockers = [];
    for (var i = 0; i < bf.length; i++) {
        var cid = bf[i];
        if (!engineIsCreature(match, seat, cid)) continue;
        var cs = match.game.cardState[cid];
        if (cs && cs.tapped) continue;
        eligibleBlockers.push(cid);
    }
    // Get attackers targeting this seat
    var incomingAttackers = [];
    var attackers = match.game.combat.attackers || {};
    for (var ak in attackers) {
        if (Number(attackers[ak]) === seat) incomingAttackers.push(ak);
    }
    if (!eligibleBlockers.length || !incomingAttackers.length) return;
    if (diff === "easy") {
        // Easy: block randomly — shuffle blockers, assign 1:1
        var shuffled = eligibleBlockers.slice();
        for (var si = shuffled.length - 1; si > 0; si--) { var ri = sup.random.integer(0, si); var tmp = shuffled[si]; shuffled[si] = shuffled[ri]; shuffled[ri] = tmp; }
        var maxBlocks = Math.min(shuffled.length, incomingAttackers.length);
        for (var bi = 0; bi < maxBlocks; bi++) {
            match.game.combat.blockers[incomingAttackers[bi]] = shuffled[bi];
        }
    } else if (diff === "medium") {
        // Medium: only block if our creature kills the attacker
        var usedB = {};
        for (var ai = 0; ai < incomingAttackers.length; ai++) {
            var atkId = incomingAttackers[ai];
            var atkSeat = engineFindSeatForCard(match, atkId);
            if (!atkSeat) continue;
            var atkTough = engineGetCreatureToughness(match, atkSeat, atkId);
            for (var bi2 = 0; bi2 < eligibleBlockers.length; bi2++) {
                var blkId = eligibleBlockers[bi2];
                if (usedB[blkId]) continue;
                var blkPow = engineGetCreaturePower(match, seat, blkId);
                if (blkPow >= atkTough) {
                    match.game.combat.blockers[atkId] = blkId;
                    usedB[blkId] = true;
                    break;
                }
            }
        }
    } else {
        // Hard: scoring system
        var usedH = {};
        for (var ai2 = 0; ai2 < incomingAttackers.length; ai2++) {
            var atkId2 = incomingAttackers[ai2];
            var atkSeat2 = engineFindSeatForCard(match, atkId2);
            if (!atkSeat2) continue;
            var atkPow2 = engineGetCreaturePower(match, atkSeat2, atkId2);
            var atkTough2 = engineGetCreatureToughness(match, atkSeat2, atkId2);
            var bestBlk = null;
            var bestScore = -999;
            for (var bi3 = 0; bi3 < eligibleBlockers.length; bi3++) {
                var blkId2 = eligibleBlockers[bi3];
                if (usedH[blkId2]) continue;
                var blkPow2 = engineGetCreaturePower(match, seat, blkId2);
                var blkTough2 = engineGetCreatureToughness(match, seat, blkId2);
                var score = 0;
                // Kill attacker?
                if (blkPow2 >= atkTough2) score += 10;
                // Survive?
                if (atkPow2 < blkTough2) score += 5;
                // Die without killing?
                if (atkPow2 >= blkTough2 && blkPow2 < atkTough2) score -= 3;
                // Block big attacker bonus
                if (atkPow2 >= 4) score += 3;
                if (score > bestScore) { bestScore = score; bestBlk = blkId2; }
            }
            if (bestBlk && bestScore > 0) {
                match.game.combat.blockers[atkId2] = bestBlk;
                usedH[bestBlk] = true;
            }
        }
    }
    var blockerCount = Object.keys(match.game.combat.blockers).length;
    if (blockerCount) {
        match.log.push({ t: Date.now(), type: "BLOCKERS_DECLARED", by: "bot", seat: seat, count: blockerCount });
    }
}

function expandDeckToList(cardsById) {
    const list = [];
    for (const [id, count] of Object.entries(cardsById || {})) { for (let i = 0; i < (Number(count) || 0); i++) list.push(id); }
    return list;
}

function shuffleInPlace(arr) {
    if (!Array.isArray(arr)) return arr;
    for (let i = arr.length - 1; i > 0; i--) { const j = sup.random.integer(0, i); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    return arr;
}

function getMatchViewForUser(match, userId) {
    const viewer = (match.players || []).find((p) => p.userId === userId);
    const out = JSON.parse(JSON.stringify(match));
    out.viewerSeat = viewer?.seat || null;
    const zones = out?.game?.zones || {};
    for (const [seatStr, z] of Object.entries(zones)) {
        if (!out.viewerSeat || Number(seatStr) === out.viewerSeat) continue;
        z.library = { count: Array.isArray(z.library) ? z.library.length : 0 };
        z.hand = { count: Array.isArray(z.hand) ? z.hand.length : 0 };
    }
    return out;
}

// --- Scryfall caching ---

function scryfallCacheGet(cache, url) {
    const hit = cache[url];
    if (hit && hit.at && Date.now() - hit.at < 1000 * 60 * 60 * 24 * 7) return hit.json;
    return null;
}

function scryfallCacheSet(cache, url, json) { cache[url] = { at: Date.now(), json }; }

function scryfallFetchJsonCached(url) {
    const cache = sup.global.get(GLOBAL_SCRYFALL_CACHE_KEY) || {};
    const cached = scryfallCacheGet(cache, url);
    if (cached) return cached;
    const res = sup.fetch(url, { headers: { "User-Agent": "SupMTG/0 (contact: @heyhaigh)", Accept: "application/json" } });
    const json = res.json();
    scryfallCacheSet(cache, url, json);
    sup.global.set(GLOBAL_SCRYFALL_CACHE_KEY, cache);
    return json;
}

function scryfallGetCardsByIdsCached(ids) {
    const unique = Array.from(new Set((ids || []).filter(Boolean)));
    if (!unique.length) return [];
    const cache = sup.global.get(GLOBAL_SCRYFALL_CACHE_KEY) || {};
    const results = []; const missing = [];
    for (const id of unique) {
        const url = `${SCRYFALL.card}/${encodeURIComponent(id)}`;
        const cached = scryfallCacheGet(cache, url);
        if (cached && cached.object === "card") results.push(cached); else missing.push(id);
    }
    for (let i = 0; i < missing.length; i += 75) {
        const chunk = missing.slice(i, i + 75);
        const body = { identifiers: chunk.map((id) => ({ id })) };
        const res = sup.fetch(SCRYFALL.collection, { method: "POST", headers: { "User-Agent": "SupMTG/0 (contact: @heyhaigh)", Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const json = res.json();
        const data = Array.isArray(json?.data) ? json.data : [];
        for (const card of data) { if (!card || card.object !== "card" || !card.id) continue; scryfallCacheSet(cache, `${SCRYFALL.card}/${encodeURIComponent(card.id)}`, card); results.push(card); }
    }
    sup.global.set(GLOBAL_SCRYFALL_CACHE_KEY, cache);
    return results;
}

function simplifyCard(card) {
    if (!card || typeof card !== "object") return null;
    const imageSmall = card.image_uris?.small || card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.small || card.card_faces?.[0]?.image_uris?.normal || null;
    const imageNormal = card.image_uris?.normal || card.image_uris?.large || card.card_faces?.[0]?.image_uris?.normal || card.card_faces?.[0]?.image_uris?.large || imageSmall || null;
    return { id: card.id, name: card.name, typeLine: card.type_line, manaCost: card.mana_cost, oracleText: card.oracle_text, imageSmall, imageNormal, legalities: card.legalities, cmc: card.cmc, colors: card.colors, colorIdentity: card.color_identity, set: card.set, collectorNumber: card.collector_number, power: card.power != null ? String(card.power) : null, toughness: card.toughness != null ? String(card.toughness) : null, keywords: Array.isArray(card.keywords) ? card.keywords : [] };
}
