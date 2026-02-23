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
    .gameGrid { display:grid; grid-template-columns:1fr 320px; gap:12px; min-height:0; }
    .battlefield { display:flex; flex-wrap:wrap; gap:8px; align-items:flex-start; }
    .cardImg { width:64px; height:90px; border-radius:12px; border:1px solid var(--border); object-fit:cover; background:rgba(18,21,26,0.06); cursor:pointer; user-select:none; transition:transform 120ms ease,box-shadow 120ms ease; }
    .cardImg:hover { transform:translateY(-1px); box-shadow:var(--shadow2); }
    .cardImg.selected { box-shadow:0 0 0 3px rgba(11,116,255,0.35),var(--shadow2); border-color:rgba(11,116,255,0.35); }
    .handRow { display:flex; gap:10px; overflow:auto; padding:8px; border-radius:14px; background:rgba(255,255,255,0.65); border:1px solid var(--border); }
    .handRow .cardImg { width:78px; height:110px; flex:0 0 auto; }
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
    .gameBoard { display:flex; flex-direction:column; height:calc(100vh - 52px); min-height:480px; background:linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%); border-radius:var(--radius); overflow:hidden; position:relative; }
    .gameBoardInner { display:flex; flex-direction:column; flex:1; min-height:0; }
    .oppSide { flex:1; display:flex; flex-direction:column; padding:12px 16px 8px; min-height:0; }
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
      .gameGrid { grid-template-columns:1fr; }
      .cardModalContent { max-width:95vw; max-height:90vh; padding:16px; }
      .cardModalImg { max-height:45vh; width:auto; margin:0 auto; display:block; }
      .appRoot.matchActive .body { grid-template-columns:1fr; }
      .gameBoard { height:auto; min-height:100vh; border-radius:0; }
      .handTray { justify-content:flex-start; }
      .handTray .cardImg { width:72px; height:100px; }
      .inspectFloat { position:fixed; top:auto; bottom:0; right:0; left:0; width:100%; border-radius:16px 16px 0 0; }
    }
  </style>

  <div id="toasts" class="toasts"></div>
  <div id="cardModal" class="cardModalOverlay" style="display:none;">
    <div class="cardModalContent">
      <button class="cardModalClose" id="cardModalClose" aria-label="Close card inspector">&times;</button>
      <img id="cardModalImg" class="cardModalImg" />
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
                <img id="inspectorImg" class="inspectorImg" />
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
    state.activeDeck.cardMeta[id] = { name: card.name, typeLine: card.typeLine };
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
    state.activeDeck.cardMeta[card.id] = { name: card.name, typeLine: card.typeLine };
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
          mulliganHandEl.appendChild(renderCardImg(id, { zone: 'hand', seat }));
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
    sub.textContent = (c.typeLine || '') + (state.selected.zone ? ' \u2022 ' + state.selected.zone : '');
    $('#btnPlaySelected').disabled = !(state.selected.zone === 'hand' && state.selected.seat === state.lastMatch?.viewerSeat);
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

  function renderCardImg(id, opts) {
    const options = opts || {};
    const c = cardMeta(id); const img = document.createElement('img');
    img.className = 'cardImg'; img.src = c?.imageSmall || c?.imageNormal || ''; img.alt = c?.name || id;
    img.dataset.cardId = id;
    if (state.selected?.id === id && state.selected?.zone === options.zone && state.selected?.seat === options.seat) img.classList.add('selected');
    img.onclick = () => setSelected({ id, zone: options.zone || null, seat: options.seat || null });
    if (options.onDblClick) img.ondblclick = options.onDblClick;
    else img.ondblclick = () => openCardModal(id, options.zone || null);
    return img;
  }

  function renderBoardSeat(match, seat, isViewer) {
    const zones = match?.game?.zones?.[seat];
    const p = (match.players || []).find(x => x.seat === seat);
    const name = p ? (p.isBot ? (p.username + ' (Bot)') : ('@' + p.username)) : ('Seat ' + seat);
    const life = match?.game?.lifeBySeat?.[seat];

    const el = document.createElement('div');
    el.style.cssText = 'display:flex;flex-direction:column;flex:1;min-height:0;';

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
    if (bf.length) {
      for (const id of bf) bfArea.appendChild(renderCardImg(id, { zone: 'battlefield', seat }));
    } else {
      bfArea.innerHTML = '<div class="emptyZone">No permanents</div>';
    }
    el.appendChild(bfArea);

    return el;
  }

  function renderTurnBar(match) {
    const bar = $('#turnBar');
    const activeSeat = match.game?.activePlayerSeat;
    const activePlayer = (match.players || []).find(p => p.seat === activeSeat);
    const activeName = activeSeat === match.viewerSeat ? 'You' : (activePlayer ? (activePlayer.isBot ? activePlayer.username : ('@' + activePlayer.username)) : ('Seat ' + activeSeat));
    const step = match.game?.step || 'begin';
    const stepLabel = step.charAt(0).toUpperCase() + step.slice(1);
    const isMyTurn = activeSeat === match.viewerSeat;

    bar.innerHTML = '<div class="turnInfo">Turn <span class="turnHighlight">' + (match.game?.turn || '?') + '</span></div>'
      + '<div class="turnInfo">' + (isMyTurn ? '<span class="turnHighlight">Your turn</span>' : escapeHtml(activeName) + "'s turn") + '</div>'
      + '<div class="turnInfo">' + escapeHtml(stepLabel) + '</div>'
      + '<button id="btnGameDraw" class="btn">Draw</button>'
      + '<button id="btnGameEndTurn" class="btn btnPrimary"' + (isMyTurn ? '' : ' disabled') + '>End turn</button>';

    bar.querySelector('#btnGameDraw').onclick = drawDebug;
    bar.querySelector('#btnGameEndTurn').onclick = endTurn;
  }

  function renderGame(match) {
    const show = !!match && match.phase === 'playing' && !!match.viewerSeat;
    $('#gamePanel').style.display = show ? '' : 'none';
    if (!show) return;

    const mySeat = match.viewerSeat;
    const seats = (match.players || []).map(p => p.seat).sort((a, b) => a - b);
    const oppSeats = seats.filter(s => s !== mySeat);

    const oppEl = $('#oppSide'); oppEl.innerHTML = '';
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
      for (const id of hand) {
        handTray.appendChild(renderCardImg(id, {
          zone: 'hand', seat: mySeat,
          onDblClick: async () => { setSelected({ id, zone: 'hand', seat: mySeat }); await playSelectedToBattlefield(); }
        }));
      }
    }
    myEl.appendChild(handTray);

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
    const res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'END_TURN' } });
    if (!res.ok) { toast('End turn failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    await refreshMatch();
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

  async function playSelectedToBattlefield() {
    const sel = state.selected; if (!state.activeMatchId || !sel?.id) return;
    if (!(sel.zone === 'hand' && sel.seat === state.lastMatch?.viewerSeat)) { toast('Select a card in your hand to play.', { type: 'warn' }); return; }
    const res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'PLAY_FROM_HAND', cardId: sel.id } });
    if (!res.ok) { toast('Play failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
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
    const landName = basicLandNameForColor(c);
    const landId = getBasicLandIdByName(landName);
    const pool = scryfallSearchAll(`f:standard id=${c} -t:land -type:basic`, { order: 'popular', maxPages: 2 });
    const picks = pool.filter((x) => x && x.object === 'card' && x.id && x.name).slice(0, 9);
    if (picks.length < 4) throw new Error('Not enough Standard-legal cards found for this mono-color quickstart.');
    const cards = {}; const cardMeta = {};
    cards[landId] = 24; cardMeta[landId] = { name: landName, typeLine: 'Basic Land' };
    for (const card of picks) { cards[card.id] = 4; cardMeta[card.id] = { name: card.name, typeLine: card.type_line || '' }; }
    const total = Object.values(cards).reduce((a, b) => a + (Number(b) || 0), 0);
    if (total < 60) cards[landId] = (Number(cards[landId]) || 0) + (60 - total);
    const names = { W:'Quickstart \u2014 Mono-White Aggro', U:'Quickstart \u2014 Mono-Blue Tempo', B:'Quickstart \u2014 Mono-Black Midrange', R:'Quickstart \u2014 Mono-Red Aggro', G:'Quickstart \u2014 Mono-Green Stompy' };
    return { name: names[c] || `Quickstart \u2014 Mono-${c}`, format: 'standard', cards, cardMeta, commander: null, commanderName: null };
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
    const pool = scryfallSearchAll(`legal:commander ${idFilter} -t:land -type:basic`, { order: 'edhrec', maxPages: 2 });
    const cards = {}; const cardMeta = {};
    cards[cmd.id] = 1; cardMeta[cmd.id] = { name: cmd.name, typeLine: cmd.type_line || '' };
    const chosen = [];
    for (const c of pool) { if (!c || c.object !== 'card' || !c.id || c.id === cmd.id) continue; chosen.push(c); if (chosen.length >= 62) break; }
    if (chosen.length < 40) throw new Error('Not enough Commander cards found for this commander color identity.');
    for (const c of chosen) { cards[c.id] = 1; cardMeta[c.id] = { name: c.name, typeLine: c.type_line || '' }; }
    let currentTotal = Object.values(cards).reduce((a, b) => a + (Number(b) || 0), 0);
    let remaining = 100 - currentTotal; if (remaining < 0) remaining = 0;
    const basics = colors.length ? colors.map(basicLandNameForColor) : ['Wastes'];
    const ids = basics.map(getBasicLandIdByName);
    for (let i = 0; i < remaining; i++) { const idx = i % ids.length; cards[ids[idx]] = (Number(cards[ids[idx]]) || 0) + 1; if (!cardMeta[ids[idx]]) cardMeta[ids[idx]] = { name: basics[idx], typeLine: 'Basic Land' }; }
    const totalAfter = Object.values(cards).reduce((a, b) => a + (Number(b) || 0), 0);
    if (totalAfter !== 100) { cards[ids[0]] = (Number(cards[ids[0]]) || 0) + (100 - totalAfter); if (cards[ids[0]] <= 0) delete cards[ids[0]]; }
    return { name: `Quickstart \u2014 ${cmd.name}`, format: 'commander', cards, cardMeta, commander: cmd.id, commanderName: cmd.name };
}

// --- Deck validation ---

function validateDeck(deck) {
    const errors = [];
    const n = deckTotalCount(deck);
    if (deck.format === "standard") { if (n < 60) errors.push(`Standard deck must have at least 60 cards (has ${n}).`); }
    else if (deck.format === "commander") {
        if (n !== 100) errors.push(`Commander deck must have exactly 100 cards (has ${n}).`);
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
        game: { turn: 0, activePlayerSeat: 1, prioritySeat: 1, step: "begin", stack: [], zones: {}, lifeBySeat: {}, mulligansBySeat: {}, keptBySeat: {} },
        decks: { 1: { deckId: hostDeck.id, format: hostDeck.format, name: hostDeck.name, commander: hostDeck.commander, cards: hostDeck.cards } },
        botsBySeat: {},
        log: [{ t: now, type: "MATCH_CREATED", by: hostUser.username, opponentType: opponentType || "human" }],
    };
    if (format === "standard" && opponentType === "bot") {
        const botId = `bot:${matchId}`;
        match.players.push({ userId: botId, username: "MTG Bot", joinedAt: now, seat: 2, isBot: true, difficulty: botDifficultyNormalize(botDifficulty) });
        match.readyByUserId[botId] = true;
        match.botsBySeat[2] = { difficulty: botDifficultyNormalize(botDifficulty) };
        match.decks[2] = { deckId: hostDeck.id, format: hostDeck.format, name: `${hostDeck.name} (Bot)`, commander: hostDeck.commander, cards: hostDeck.cards };
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
        match.decks[player.seat] = { deckId: deck.id, format: deck.format, name: deck.name, commander: deck.commander, cards: deck.cards };
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
            match.phase = "playing"; match.game.step = "begin";
            let startSeat = 1;
            if (matchHasBot(match) && match.players.length === 2) { const human = match.players.find((p) => !p.isBot); startSeat = human?.seat || 1; }
            else { const seats = match.players.map((p) => p.seat); startSeat = seats[sup.random.integer(0, Math.max(0, seats.length - 1))] || 1; }
            match.game.activePlayerSeat = startSeat; match.game.prioritySeat = startSeat;
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
        const cardId = action.cardId; if (!cardId) return { ok: false, error: "cardId is required" };
        const ok = engineMoveCard(match, seat, "hand", "battlefield", cardId); if (!ok.ok) return ok;
        match.log.push({ t: Date.now(), type: "PLAY", by: user.username, seat, cardId });
        if (match.game.step === "begin") match.game.step = "main";
        return { ok: true, match };
    }

    if (action.type === "MOVE_BATTLEFIELD_TO_GRAVEYARD") {
        if (match.phase !== "playing") return { ok: false, error: "can only move during playing phase" };
        const seat = player.seat;
        if (match.game?.activePlayerSeat != null && seat !== match.game.activePlayerSeat) return { ok: false, error: "not your turn" };
        const cardId = action.cardId; if (!cardId) return { ok: false, error: "cardId is required" };
        const ok = engineMoveCard(match, seat, "battlefield", "graveyard", cardId); if (!ok.ok) return ok;
        match.log.push({ t: Date.now(), type: "MOVE_TO_GY", by: user.username, seat, cardId });
        if (match.game.step === "begin") match.game.step = "main";
        return { ok: true, match };
    }

    if (action.type === "END_TURN") {
        if (match.phase !== "playing") return { ok: false, error: "can only end turn during playing phase" };
        const seat = player.seat;
        if (match.game?.activePlayerSeat != null && seat !== match.game.activePlayerSeat) return { ok: false, error: "not your turn" };
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
    from.splice(idx, 1); to.push(cardId); return { ok: true };
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
    match.game.step = "begin";
    engineEnsureZones(match, next); engineDrawCards(match, next, 1);
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

function engineBotTakeTurn(match, botPlayer) {
    const seat = botPlayer.seat; const diff = botDifficultyNormalize(botPlayer.difficulty);
    engineEnsureZones(match, seat); const hand = Array.isArray(match.game.zones[seat].hand) ? match.game.zones[seat].hand : [];
    let willPlay = false;
    if (diff === "medium") willPlay = hand.length > 0 && sup.random.integer(0, 1) === 1;
    if (diff === "hard") willPlay = hand.length > 0;
    if (willPlay && hand.length) {
        const idx = sup.random.integer(0, hand.length - 1);
        const cardId = hand[Math.min(hand.length - 1, Math.max(0, idx))];
        engineMoveCard(match, seat, "hand", "battlefield", cardId);
        match.log.push({ t: Date.now(), type: "BOT_PLAY", by: "bot", seat, difficulty: diff, cardId });
    } else { match.log.push({ t: Date.now(), type: "BOT_PASS", by: "bot", seat, difficulty: diff }); }
    engineAdvanceTurn(match, { by: "bot" });
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
    return { id: card.id, name: card.name, typeLine: card.type_line, manaCost: card.mana_cost, oracleText: card.oracle_text, imageSmall, imageNormal, legalities: card.legalities, cmc: card.cmc, colors: card.colors, colorIdentity: card.color_identity, set: card.set, collectorNumber: card.collector_number };
}
