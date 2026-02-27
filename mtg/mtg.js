// MTG (Standard + Commander v1) Launch App
// v0.1.0: Deck library + Scryfall search + match state scaffolding.

const SCRYFALL = {
    search: "https://api.scryfall.com/cards/search",
    card: "https://api.scryfall.com/cards",
    collection: "https://api.scryfall.com/cards/collection",
};

const USER_DECKS_KEY = "mtg.decks.v1";
const GLOBAL_SCRYFALL_CACHE_KEY = "mtg.scryfallCache.v2";
function init() {
    sup.makePublic(
        api_boot, api_searchCards, api_getCardsBulk,
        api_listDecks, api_saveDeck, api_deleteDeck,
        api_createQuickstartStandardDeck, api_createQuickstartCommanderDeck,
        api_createMatch, api_joinMatch, api_getMatch, api_matchAction
    );
}

function launch() {
    return sup.html(getClientHtml(), {
        width: 1200, height: 800,
        callbacks: [
            "api_boot","api_searchCards","api_getCardsBulk",
            "api_listDecks","api_saveDeck","api_deleteDeck",
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
      --w06:rgba(255,255,255,0.06); --w08:rgba(255,255,255,0.08); --w1:rgba(255,255,255,0.1);
      --w15:rgba(255,255,255,0.15); --w45:rgba(255,255,255,0.45); --b5:rgba(0,0,0,0.5);
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
    .manaExplainer { font-size:13px; color:var(--text); line-height:1.45; margin-top:6px; }
    .manaExplainerTip { font-size:12px; color:var(--muted); line-height:1.4; margin-top:8px; }
    .noteDisclaimer { font-size:11px; color:var(--muted2); line-height:1.35; margin-top:10px; padding-top:10px; border-top:1px solid var(--border); }
    .content { padding:16px; min-height:0; overflow:auto; }
    /* tab visibility controlled entirely via inline JS — no CSS display rules */
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
    .appRoot.matchActive #tab-play > .card:last-child:not(#lobbyPanel) { display:none; }
    /* Game board - Arena-style vertical split */
    .gameBoard { display:flex; flex-direction:column; height:calc(100vh - 52px); min-height:480px; background:linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%); border-radius:var(--radius); overflow:hidden; position:relative; contain:layout style; }
    .gameBoardInner { display:flex; flex-direction:column; flex:1; min-height:0; }
    .oppSide { flex:1; display:flex; flex-direction:column; padding:12px 16px 8px; min-height:0; gap:4px; }
    .oppSide.multi { flex-direction:row; gap:8px; overflow-x:auto; }
    .oppSide.multi .seatPanel { flex:1; min-width:140px; }
    .oppSide.multi .bfArea { min-height:40px; }
    .oppSide.multi .bfArea .cardImg { width:52px; height:72px; }
    .oppHandTray { display:flex; gap:6px; overflow-x:auto; padding:6px 8px; justify-content:center; background:var(--w06); border-radius:10px; border:1px solid var(--w08); flex:0 0 auto; }
    .oppHandCard { width:48px; height:67px; border-radius:6px; border:none; object-fit:cover; flex:0 0 auto; transition:transform 180ms ease, box-shadow 200ms ease; }
    .oppHandCard:hover { transform:translateY(-4px); }
    .oppHandCard.highlight { border-color:rgba(251,191,36,0.7); box-shadow:0 0 10px rgba(251,191,36,0.35); }
    @keyframes oppCardExit { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(20px) scale(0.8)} }
    .oppHandCard.exiting { animation:oppCardExit 0.35s ease forwards; }
    .oppSide.multi .oppHandTray { padding:4px 6px; }
    .oppSide.multi .oppHandCard { width:36px; height:50px; border-radius:5px; }
    .seatPanel { display:flex; flex-direction:column; flex:1; min-height:0; border-radius:10px; padding:6px 8px; position:relative; overflow:visible; }
    .seatPanel.lowHealth::before { content:''; position:absolute; inset:0; border-radius:10px; background:rgba(220,38,38,0.08); animation:lowHealthPulse 2.5s ease-in-out infinite; pointer-events:none; z-index:0; }
    @keyframes lowHealthPulse { 0%,100% { background:rgba(220,38,38,0.04); } 50% { background:rgba(220,38,38,0.14); } }
    @keyframes victoryPulse { 0%,100%{background:rgba(34,197,94,0.03)} 50%{background:rgba(34,197,94,0.10)} }
    .gameOverOverlay.victoryPulse::before { content:''; position:absolute; inset:0; background:rgba(34,197,94,0.05); animation:victoryPulse 2.5s ease-in-out infinite; pointer-events:none; z-index:0; }
    .seatBar { display:flex; align-items:center; justify-content:space-between; gap:10px; position:relative; z-index:1; }
    .seatName { font-weight:800; font-size:14px; color:rgba(255,255,255,0.85); }
    .lifeBadge { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:999px; background:rgba(255,255,255,0.12); color:#fff; font-size:13px; font-weight:700; border:1px solid var(--w15); }
    .lifeIcon { font-size:16px; }
    .zoneRow { display:flex; gap:8px; flex-wrap:wrap; margin-top:6px; position:relative; z-index:1; }
    .zoneBadge { padding:4px 8px; border-radius:8px; background:var(--w08); color:rgba(255,255,255,0.6); font-size:11px; font-weight:600; border:1px solid var(--w08); }
    .bfRow { flex:1; display:flex; gap:8px; padding:8px 10px; min-height:60px; overflow:visible; align-items:flex-end; }
    .bfArea { flex:1; display:flex; flex-wrap:wrap; gap:8px; align-items:flex-end; justify-content:center; min-height:40px; overflow:visible; }
    .bfArea .cardImg { width:72px; height:100px; border:1px solid var(--w15); border-radius:10px; }
    .bfArea .cardImg:hover { transform:translateY(-4px) scale(1.05); box-shadow:0 8px 20px rgba(0,0,0,0.3); }
    .turnBar { display:flex; align-items:center; justify-content:center; gap:16px; padding:8px 16px; background:var(--w06); border-top:1px solid var(--w08); border-bottom:1px solid var(--w08); flex:0 0 auto; }
    .turnInfo { font-size:13px; color:rgba(255,255,255,0.75); font-weight:600; }
    .turnHighlight { color:#fbbf24; font-weight:800; }
    .turnBar .btn { font-size:12px; padding:6px 14px; background:rgba(255,255,255,0.10); color:#fff; border-color:var(--w15); }
    .turnBar .btn:hover { background:rgba(255,255,255,0.18); }
    .turnBar .btnPrimary { background:rgba(11,116,255,0.7); border-color:rgba(11,116,255,0.5); }
    .turnBar .btnPrimary:hover { background:rgba(11,116,255,0.85); }
    .handMana { display:flex; align-items:center; gap:6px; padding:4px 10px; flex:0 0 auto; border-right:1px solid var(--w1); margin-right:2px; }
    .handMana .hmLabel { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:rgba(192,132,252,0.85); margin-right:2px; }
    .handMana .hmGem { width:24px; height:24px; border-radius:50%; border:2px solid rgba(255,255,255,0.2); transition:all 200ms ease; }
    .handMana .hmGem.full { background:radial-gradient(circle at 35% 35%, #c084fc, #7c3aed 60%, #5b21b6); border-color:rgba(124,58,237,0.6); box-shadow:0 0 10px rgba(124,58,237,0.4); }
    .handMana .hmGem.empty { background:var(--w06); border-color:var(--w1); transform:scale(0.85); opacity:0.5; }
    .handMana .hmText { font-size:14px; font-weight:800; color:rgba(255,255,255,0.8); margin-left:4px; }
    .cardImg.unplayable { opacity:0.45; filter:saturate(0.3); }
    .cardImg.unplayable:hover { opacity:0.6; filter:saturate(0.5); }
    .botThinking { display:flex; align-items:center; gap:8px; padding:8px 16px; background:rgba(251,191,36,0.12); border:1px solid rgba(251,191,36,0.25); border-radius:10px; color:rgba(255,255,255,0.85); font-size:13px; font-weight:600; }
    .cmdBotSlot { padding:8px 10px; margin-bottom:8px; border:1px solid var(--border); border-radius:8px; background:rgba(255,255,255,0.03); }
    .cmdBotSlot .slotLabel { font-size:12px; font-weight:700; margin-bottom:6px; color:var(--muted); }
    .cmdBotSlot .slotRow { display:flex; gap:8px; }
    .cmdBotSlot .slotRow select { flex:1; }
    .reconnectBanner { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); display:flex; align-items:center; gap:8px; padding:12px 24px; background:rgba(220,38,38,0.15); border:1px solid rgba(220,38,38,0.3); border-radius:12px; color:rgba(255,255,255,0.9); font-size:14px; font-weight:600; z-index:50; backdrop-filter:blur(6px); }
    .reconnectBanner .spinner { width:16px; height:16px; border:2px solid rgba(220,38,38,0.3); border-top-color:#ef4444; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
    .cardWrap { position:relative; display:inline-block; flex:0 0 auto; }
    .ptBadge { position:absolute; bottom:4px; right:4px; background:rgba(0,0,0,0.82); color:#fff; font-size:10px; font-weight:800; padding:2px 5px; border-radius:5px; line-height:1; pointer-events:none; border:1px solid rgba(255,255,255,0.2); font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace; z-index:2; }
    .ptBadge .ptDamaged { color:#ef4444; }
    .cardWrap.summonSick .cardImg { opacity:0.55; filter:saturate(0.4); }
    .summonSickIcon { position:absolute; top:4px; right:4px; width:18px; height:18px; background:rgba(0,0,0,0.7); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; pointer-events:none; z-index:2; border:1px solid var(--w15); }
    .spellOverlay { position:fixed; top:0; left:0; width:100%; height:100%; z-index:100; display:flex; align-items:center; justify-content:center; background:var(--b5); pointer-events:none; }
    .spellOverlay img { width:240px; height:336px; border-radius:16px; box-shadow:0 0 60px rgba(124,58,237,0.5),0 20px 60px rgba(0,0,0,0.4); animation:spellCast 1.6s ease-out forwards; }
    @keyframes spellCast { 0%{transform:scale(0.3) rotate(-8deg);opacity:0} 15%{transform:scale(1.05) rotate(0deg);opacity:1} 70%{transform:scale(1) rotate(0deg);opacity:1} 100%{transform:scale(0.4) translateY(60vh) rotate(12deg);opacity:0} }
    .botPlayReveal { position:fixed; top:0; left:0; width:100%; height:100%; z-index:100; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(0,0,0,0.55); pointer-events:none; animation:botRevealBg 1.4s ease-out forwards; }
    .botPlayReveal img { width:200px; height:280px; border-radius:14px; box-shadow:0 0 40px rgba(239,68,68,0.35),0 16px 48px rgba(0,0,0,0.5); animation:botRevealCard 1.3s ease-out forwards; }
    .botPlayReveal .botRevealLabel { color:#fff; font-size:15px; font-weight:700; margin-top:12px; text-shadow:0 2px 8px rgba(0,0,0,0.6); opacity:0; animation:fadeIn 0.25s ease 0.1s forwards; letter-spacing:0.5px; }
    .botPlayReveal .botRevealSub { color:rgba(255,255,255,0.6); font-size:12px; font-weight:600; margin-top:4px; text-shadow:0 1px 4px rgba(0,0,0,0.5); opacity:0; animation:fadeIn 0.25s ease 0.2s forwards; }
    @keyframes botRevealCard { 0%{transform:scale(0.4) translateY(-30px);opacity:0} 10%{transform:scale(1.03);opacity:1} 70%{transform:scale(1);opacity:1} 100%{transform:scale(0.5) translateY(40px);opacity:0} }
    @keyframes botRevealBg { 0%{opacity:0} 8%{opacity:1} 75%{opacity:1} 100%{opacity:0} }
    @keyframes fadeIn { to{opacity:1} }
    .botAttackOverlay { background:rgba(239,68,68,0.12) !important; }
    .botAttackOverlay .turnOverlayText { color:rgba(239,68,68,0.95) !important; text-shadow:0 0 30px rgba(239,68,68,0.4) !important; }
    .millOverlay { position:fixed; top:0; left:0; width:100%; height:100%; z-index:110; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(0,0,0,0.7); }
    .millOverlay .millTitle { color:#fff; font-size:16px; font-weight:700; margin-bottom:14px; text-shadow:0 2px 8px rgba(0,0,0,0.6); }
    .millOverlay .millCards { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; max-width:90%; }
    .millOverlay .millCard { width:120px; height:168px; border-radius:10px; box-shadow:0 4px 20px rgba(0,0,0,0.4); animation:millCardIn 0.35s ease-out forwards; opacity:0; }
    .millOverlay .millCard:nth-child(2) { animation-delay:0.15s; }
    .millOverlay .millCard:nth-child(3) { animation-delay:0.3s; }
    .millOverlay .millCard:nth-child(4) { animation-delay:0.45s; }
    .millOverlay .millCard:nth-child(5) { animation-delay:0.6s; }
    .millOverlay .millCardName { color:rgba(255,255,255,0.8); font-size:11px; text-align:center; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:120px; }
    .millOverlay .millOk { margin-top:18px; padding:10px 28px; border-radius:12px; border:1px solid rgba(255,255,255,0.25); background:rgba(255,255,255,0.15); color:#fff; font-size:14px; font-weight:700; cursor:pointer; transition:background 120ms ease; }
    .millOverlay .millOk:hover { background:rgba(255,255,255,0.25); }
    @keyframes millCardIn { from { transform:translateY(-20px) scale(0.8); opacity:0; } to { transform:translateY(0) scale(1); opacity:1; } }
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
    .combatSvg { position:absolute; inset:0; z-index:15; pointer-events:none; overflow:visible; }
    .combatLine { stroke:rgba(59,130,246,0.55); stroke-width:2; stroke-dasharray:6 3; }
    .combatLineDot { fill:rgba(59,130,246,0.7); }
    .kwIcons { position:absolute; display:flex; gap:2px; z-index:3; pointer-events:none; }
    .kwIcons-tl { top:3px; left:3px; flex-direction:column; }
    .kwIcons-tr { top:3px; right:3px; flex-direction:column; align-items:flex-end; }
    .kwIcons-bl { bottom:20px; left:3px; flex-direction:column; }
    .kwIcon { width:16px; height:16px; background:rgba(0,0,0,0.72); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:9px; line-height:1; border:1px solid var(--w15); color:#fff; }
    .kwPill { display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:700; background:rgba(59,130,246,0.12); color:#3b82f6; border:1px solid rgba(59,130,246,0.25); }
    .kwPillUnsupported { background:var(--w06); color:var(--w45); border-color:var(--w1); }
    .cardModalKeywords { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
    .cardModalWarn { margin-top:10px; padding:8px 12px; border-radius:8px; font-size:12px; color:#f59e0b; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.2); }
    .cardModalAuras { margin-top:10px; font-size:12px; color:var(--muted); }
    .cardModalAuras strong { color:var(--text); font-weight:700; }
    .cardWrap.canTarget { box-shadow:0 0 8px 2px rgba(168,85,247,0.5); border-radius:12px; cursor:pointer; }
    .cardWrap.targetSelected { box-shadow:0 0 10px 3px rgba(168,85,247,0.7); border-radius:12px; transform:translateY(-6px); }
    .cardWrap.targetIneligible .cardImg { opacity:0.35; filter:saturate(0.2); }
    .targetBanner { display:flex; align-items:center; justify-content:center; gap:8px; padding:6px 14px; background:rgba(168,85,247,0.12); border:1px solid rgba(168,85,247,0.25); border-radius:10px; color:rgba(255,255,255,0.9); font-size:13px; font-weight:700; }
    .atkTargetBanner { display:flex; align-items:center; justify-content:center; gap:8px; padding:6px 14px; background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.25); border-radius:10px; color:rgba(255,255,255,0.9); font-size:13px; font-weight:700; }
    .seatPanel.atkTargetable { outline:2px dashed rgba(239,68,68,0.6); outline-offset:-2px; cursor:pointer; transition:outline 0.15s ease, background 0.15s ease; }
    .seatPanel.atkTargetable:hover { outline:3px solid rgba(239,68,68,1); background:rgba(239,68,68,0.08); }
    .quickToggle { display:flex; align-items:center; gap:5px; font-size:11px; color:rgba(255,255,255,0.5); cursor:pointer; user-select:none; }
    .quickToggle input[type="checkbox"] { accent-color:#fbbf24; width:14px; height:14px; cursor:pointer; }
    .auraBadge { position:absolute; bottom:20px; left:50%; transform:translateX(-50%); background:rgba(168,85,247,0.85); color:#fff; font-size:9px; font-weight:700; padding:1px 5px; border-radius:4px; pointer-events:none; z-index:3; border:1px solid rgba(255,255,255,0.2); }
    .modeOverlay { position:absolute; inset:0; z-index:50; background:rgba(0,0,0,0.8); backdrop-filter:blur(6px); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; animation:modeOverlayIn 0.3s ease; }
    @keyframes modeOverlayIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
    .modePanel { background:rgba(30,30,50,0.95); border:1px solid rgba(168,85,247,0.4); border-radius:16px; padding:24px; max-width:480px; width:90%; display:flex; flex-direction:column; gap:14px; box-shadow:0 8px 40px rgba(0,0,0,0.5); }
    .modePanelTitle { font-size:20px; font-weight:900; color:#fff; text-align:center; letter-spacing:-0.02em; }
    .modePanelSubtitle { font-size:13px; color:rgba(255,255,255,0.55); text-align:center; margin-top:-8px; }
    .modeOption { padding:12px 16px; border-radius:10px; background:rgba(255,255,255,0.06); border:2px solid rgba(255,255,255,0.1); cursor:pointer; transition:all 0.15s ease; color:rgba(255,255,255,0.8); font-size:13px; line-height:1.4; }
    .modeOption:hover { background:rgba(168,85,247,0.12); border-color:rgba(168,85,247,0.35); }
    .modeOption.selected { background:rgba(168,85,247,0.2); border-color:rgba(168,85,247,0.7); color:#fff; box-shadow:0 0 12px rgba(168,85,247,0.2); }
    .modeOption.disabled { opacity:0.35; cursor:not-allowed; pointer-events:none; }
    .modeControls { display:flex; gap:10px; justify-content:center; margin-top:4px; }
    .modeControls button { padding:8px 20px; border-radius:8px; font-weight:700; font-size:13px; border:none; cursor:pointer; transition:all 0.15s ease; }
    .modeBtnConfirm { background:rgba(168,85,247,0.8); color:#fff; }
    .modeBtnConfirm:hover { background:rgba(168,85,247,1); }
    .modeBtnConfirm:disabled { opacity:0.4; cursor:not-allowed; }
    .modeBtnCancel { background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.7); }
    .modeBtnCancel:hover { background:rgba(255,255,255,0.15); }
    .responseBanner { display:flex; align-items:center; justify-content:center; gap:8px; padding:8px 16px; background:rgba(168,85,247,0.15); border:1px solid rgba(168,85,247,0.4); border-radius:10px; color:rgba(255,255,255,0.95); font-size:14px; font-weight:700; animation:responsePulse 2s ease-in-out infinite; }
    @keyframes responsePulse { 0%,100%{border-color:rgba(168,85,247,0.4)} 50%{border-color:rgba(168,85,247,0.8)} }
    .cardImg.instantGlow { box-shadow:0 0 12px rgba(168,85,247,0.7), 0 0 24px rgba(168,85,247,0.3); animation:instantGlowPulse 1.5s ease-in-out infinite; }
    @keyframes instantGlowPulse { 0%,100%{box-shadow:0 0 12px rgba(168,85,247,0.7),0 0 24px rgba(168,85,247,0.3)} 50%{box-shadow:0 0 18px rgba(168,85,247,1),0 0 36px rgba(168,85,247,0.5)} }
    .equipBadge { position:absolute; bottom:20px; right:4px; background:rgba(251,191,36,0.85); color:#000; font-size:9px; font-weight:700; padding:1px 5px; border-radius:4px; pointer-events:none; z-index:3; border:1px solid rgba(255,255,255,0.2); }
    .equippedToBadge { position:absolute; bottom:2px; left:50%; transform:translateX(-50%); background:rgba(251,191,36,0.9); color:#000; font-size:8px; font-weight:700; padding:1px 5px; border-radius:3px; pointer-events:none; z-index:3; white-space:nowrap; max-width:90%; overflow:hidden; text-overflow:ellipsis; border:1px solid rgba(255,255,255,0.25); }
    .equipPeek { position:absolute; top:-14px; left:50%; transform:translateX(-50%); width:56px; height:14px; border-radius:4px 4px 0 0; overflow:hidden; border:1px solid rgba(251,191,36,0.5); border-bottom:none; cursor:pointer; z-index:4; }
    .equipPeek img { width:56px; height:80px; object-fit:cover; object-position:top; pointer-events:none; }
    .scryOverlay { position:absolute; inset:0; z-index:50; background:rgba(0,0,0,0.8); backdrop-filter:blur(6px); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; animation:modeOverlayIn 0.3s ease; }
    .scryPanel { background:rgba(30,30,50,0.95); border:1px solid rgba(59,130,246,0.4); border-radius:16px; padding:24px; max-width:560px; width:92%; display:flex; flex-direction:column; gap:14px; box-shadow:0 8px 40px rgba(0,0,0,0.5); }
    .scryPanelTitle { font-size:20px; font-weight:900; color:#fff; text-align:center; letter-spacing:-0.02em; }
    .scryPanelSubtitle { font-size:13px; color:rgba(255,255,255,0.55); text-align:center; margin-top:-8px; }
    .scryZoneLabel { font-size:12px; font-weight:700; text-transform:uppercase; color:rgba(255,255,255,0.45); margin-bottom:4px; }
    .scryZone { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; min-height:100px; padding:12px; border-radius:10px; border:2px dashed rgba(255,255,255,0.12); background:rgba(255,255,255,0.03); }
    .scryZone.top { border-color:rgba(59,130,246,0.3); background:rgba(59,130,246,0.05); }
    .scryZone.bottom { border-color:rgba(239,68,68,0.3); background:rgba(239,68,68,0.05); }
    .scryCard { width:80px; height:112px; border-radius:6px; overflow:hidden; border:2px solid rgba(255,255,255,0.15); cursor:pointer; transition:all 0.15s ease; position:relative; }
    .scryCard:hover { border-color:rgba(59,130,246,0.7); transform:translateY(-3px); }
    .scryCard img { width:100%; height:100%; object-fit:cover; pointer-events:none; }
    .scryCard .scryOrder { position:absolute; top:2px; right:2px; width:18px; height:18px; border-radius:50%; background:rgba(59,130,246,0.9); color:#fff; font-size:10px; font-weight:900; display:flex; align-items:center; justify-content:center; }
    .scryControls { display:flex; gap:10px; justify-content:center; margin-top:4px; }
    .scryControls button { padding:8px 20px; border-radius:8px; font-weight:700; font-size:13px; border:none; cursor:pointer; transition:all 0.15s ease; }
    .scryBtnConfirm { background:rgba(59,130,246,0.8); color:#fff; }
    .scryBtnConfirm:hover { background:rgba(59,130,246,1); }
    .scryBtnCancel { background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.7); }
    .scryBtnCancel:hover { background:rgba(255,255,255,0.15); }
    .ptBuffed { color:#22c55e; }
    .phaseBar { display:flex; gap:4px; align-items:center; }
    .phasePill { padding:3px 8px; border-radius:6px; font-size:10px; font-weight:700; text-transform:uppercase; background:var(--w06); color:rgba(255,255,255,0.35); border:1px solid var(--w06); }
    .phasePill.active { background:rgba(251,191,36,0.18); color:#fbbf24; border-color:rgba(251,191,36,0.35); animation:phaseActivate 0.3s ease; }
    @keyframes phaseActivate { 0%{background:var(--w06);color:rgba(255,255,255,0.35);border-color:var(--w06)} 100%{background:rgba(251,191,36,0.18);color:#fbbf24;border-color:rgba(251,191,36,0.35)} }
    .dmgFloat { position:absolute; font-size:24px; font-weight:900; color:#ef4444; text-shadow:0 2px 8px var(--b5); pointer-events:none; z-index:30; animation:dmgFloatUp 1.2s ease-out forwards; }
    @keyframes dmgFloatUp { 0%{opacity:1;transform:translateY(0) scale(1.2)} 60%{opacity:1;transform:translateY(-30px) scale(1)} 100%{opacity:0;transform:translateY(-50px) scale(0.8)} }
    .dmgFloatHeal { position:absolute; font-size:24px; font-weight:900; color:#22c55e; text-shadow:0 2px 8px var(--b5); pointer-events:none; z-index:30; animation:dmgFloatUp 1.2s ease-out forwards; }
    .deathOverlay { position:absolute; z-index:25; border-radius:10px; pointer-events:none; display:flex; align-items:center; justify-content:center; font-size:32px; animation:deathFade 0.8s ease-out forwards; }
    @keyframes deathFade { 0%{background:rgba(239,68,68,0.4);opacity:1} 30%{background:rgba(239,68,68,0.2);opacity:1} 100%{background:transparent;opacity:0} }
    .combatBanner { display:flex; align-items:center; justify-content:center; gap:8px; padding:6px 14px; background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.25); border-radius:10px; color:rgba(255,255,255,0.9); font-size:13px; font-weight:700; animation:combatBannerIn 0.3s ease; }
    @keyframes combatBannerIn { 0%{opacity:0;transform:scaleX(0.8)} 100%{opacity:1;transform:scaleX(1)} }
    .mulliganOverlay { position:absolute; inset:0; z-index:42; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; animation:mulliganIn 0.4s ease; }
    @keyframes mulliganIn { from{opacity:0} to{opacity:1} }
    .mulliganTitle { font-size:28px; font-weight:900; color:#fff; letter-spacing:-0.02em; text-shadow:0 2px 12px rgba(0,0,0,0.4); }
    .mulliganBanner { max-width:520px; padding:14px 18px; background:rgba(59,130,246,0.15); border:1px solid rgba(59,130,246,0.3); border-radius:12px; color:rgba(255,255,255,0.88); font-size:13px; line-height:1.5; text-align:center; }
    .mulliganHandDisplay { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; padding:8px 0; }
    .mulliganHandDisplay .cardImg { width:120px; height:168px; border-radius:10px; border:1px solid rgba(255,255,255,0.18); transition:transform 180ms ease, box-shadow 180ms ease; cursor:default; }
    .mulliganHandDisplay .cardImg:hover { transform:translateY(-10px) scale(1.04); box-shadow:0 14px 32px rgba(0,0,0,0.4); }
    .mulliganControls { display:flex; align-items:center; gap:12px; }
    .mulliganCountBadge { padding:5px 12px; border-radius:999px; font-size:12px; font-weight:700; background:var(--w1); border:1px solid var(--w15); color:rgba(255,255,255,0.7); }
    .mulliganCountBadge.warning { background:rgba(245,158,11,0.15); border-color:rgba(245,158,11,0.35); color:#fbbf24; }
    .mulliganStatusMsg { font-size:12px; color:rgba(255,255,255,0.5); min-height:16px; text-align:center; }
    .gameOverOverlay { position:absolute; inset:0; z-index:40; background:rgba(0,0,0,0.7); backdrop-filter:blur(4px); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; animation:gameOverIn 0.4s ease; }
    @keyframes gameOverIn { from{opacity:0} to{opacity:1} }
    .gameOverTitle { font-size:48px; font-weight:900; letter-spacing:-0.03em; text-shadow:0 4px 20px var(--b5); animation:gameOverPop 0.5s ease; }
    @keyframes gameOverPop { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
    .turnOverlay { position:absolute; inset:0; z-index:45; background:rgba(0,0,0,0.70); display:flex; align-items:center; justify-content:center; pointer-events:none; animation:turnOverlayIn 0.3s ease forwards; }
    .turnOverlay.fadeOut { animation:turnOverlayOut 0.4s ease forwards; }
    .turnOverlayText { font-size:56px; font-weight:900; letter-spacing:-0.03em; color:white; text-transform:uppercase; text-shadow:0 4px 30px rgba(0,0,0,0.6); animation:turnTextPop 0.4s ease; }
    .turnOverlay.myTurn .turnOverlayText { color:#fbbf24; }
    @keyframes turnOverlayIn { from{opacity:0} to{opacity:1} }
    @keyframes turnOverlayOut { from{opacity:1} to{opacity:0} }
    @keyframes turnTextPop { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
    .gameOverTitle.victory { color:#22c55e; }
    .gameOverTitle.defeat { color:#ef4444; }
    .gameOverStats { display:flex; gap:16px; flex-wrap:wrap; justify-content:center; }
    .gameOverStat { padding:8px 14px; background:var(--w1); border:1px solid var(--w15); border-radius:10px; text-align:center; }
    .gameOverStatVal { font-size:20px; font-weight:800; color:#fff; }
    .gameOverStatLabel { font-size:11px; color:rgba(255,255,255,0.6); margin-top:2px; }
    .gameOverBtns { display:flex; gap:10px; margin-top:8px; }
    .gameOverReason { font-size:14px; color:rgba(255,255,255,0.6); margin-top:-8px; }
    .gameOverSection { font-size:12px; color:var(--w45); text-transform:uppercase; letter-spacing:0.05em; margin-top:8px; }
    .lifeBadge.critical { background:rgba(239,68,68,0.25); border-color:rgba(239,68,68,0.4); animation:lifePulse 1s ease infinite; }
    @keyframes lifePulse { 0%,100%{box-shadow:none} 50%{box-shadow:0 0 12px rgba(239,68,68,0.4)} }
    .lifeBadge.flash { animation:lifeFlash 0.4s ease; }
    @keyframes lifeFlash { 0%{background:rgba(239,68,68,0.5)} 100%{background:rgba(255,255,255,0.12)} }
    @keyframes manaEntrance { 0%{opacity:0;transform:translateY(8px) scale(0.9)} 100%{opacity:1;transform:translateY(0) scale(1)} }
    .handMana.manaEnter { animation:manaEntrance 0.5s ease forwards; animation-delay:0.8s; opacity:0; }
    .botThinking .spinner { width:14px; height:14px; border:2px solid rgba(251,191,36,0.3); border-top-color:#fbbf24; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
    .turnOrder { display:flex; gap:4px; align-items:center; }
    .turnDot { width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; color:rgba(255,255,255,0.5); background:var(--w08); border:1px solid var(--w1); transition:all 200ms ease; }
    .turnDot.now { color:#fbbf24; background:rgba(251,191,36,0.18); border-color:rgba(251,191,36,0.4); }
    .lobbyTurnOrder { display:flex; gap:6px; align-items:center; flex-wrap:wrap; margin-top:8px; padding:8px 10px; border-radius:10px; background:rgba(0,0,0,0.03); border:1px solid var(--border); }
    .lobbyTurnOrder .turnLabel { font-size:11px; font-weight:700; color:var(--muted); margin-right:4px; }
    .lobbyTurnOrder .seatChip { display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:600; background:rgba(0,0,0,0.05); border:1px solid var(--border); }
    .lobbyTurnOrder .seatChip.me { border-color:rgba(11,116,255,0.3); background:rgba(11,116,255,0.08); color:#0a4db3; }
    .mySide { flex:1; display:flex; flex-direction:column; padding:0 16px 12px; min-height:0; gap:0; }
    .mySide .bfArea { align-items:flex-start; }
    .mySide .bfRow { align-items:flex-start; }
    .handTray { display:flex; gap:10px; overflow-x:auto; padding:10px 8px; justify-content:center; background:var(--w06); border-radius:14px; border:1px solid var(--w08); margin-top:auto; flex:0 0 auto; }
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
    .inspectFloatClose { position:absolute; top:6px; right:6px; width:24px; height:24px; border-radius:999px; border:1px solid var(--w15); background:var(--w1); color:rgba(255,255,255,0.7); font-size:15px; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:2; transition:background 120ms ease; padding:0; line-height:1; }
    .tokenWrap { position:relative; display:inline-block; }
    .tokenIndicator { position:absolute; top:2px; left:2px; background:rgba(245,158,11,0.85); color:#000; font-size:8px; font-weight:800; width:14px; height:14px; border-radius:50%; display:flex; align-items:center; justify-content:center; z-index:3; pointer-events:none; }
    .tokenTray { display:flex; flex-direction:column; gap:4px; align-items:center; padding:6px 8px; flex:0 0 auto; justify-content:center; background:rgba(245,158,11,0.06); border-radius:8px; border:1px solid rgba(245,158,11,0.15); align-self:center; }
    .tokenTray .tokenCardWrap { position:relative; display:inline-flex; flex-direction:column; align-items:center; cursor:pointer; }
    .tokenTray .tokenCard { width:48px; height:67px; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(20,20,30,0.85); border:1px solid rgba(245,158,11,0.3); }
    .tokenTray .tokenCard:hover { border-color:rgba(245,158,11,0.6); background:rgba(30,30,45,0.95); }
    .tokenTray .tokenEmoji { font-size:24px; line-height:1; }
    .tokenTray .tokenLabel { font-size:8px; color:rgba(255,255,255,0.6); font-weight:700; margin-top:2px; text-align:center; max-width:46px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .tokenTray .tokenCount { position:absolute; top:-4px; right:-4px; background:rgba(245,158,11,0.85); color:#000; font-size:9px; font-weight:800; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; z-index:3; }
    .tokenTrayLabel { font-size:9px; font-weight:700; color:rgba(245,158,11,0.6); text-transform:uppercase; letter-spacing:0.04em; }
    .inspectFloatClose:hover { background:rgba(255,255,255,0.2); color:#fff; }
    .zoneBrowserOverlay { position:fixed; inset:0; z-index:50; background:rgba(0,0,0,0.7); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; animation:gameOverIn 0.3s ease; }
    .zoneBrowserContent { background:var(--surface); border-radius:var(--radius); box-shadow:var(--shadow); max-width:600px; width:90vw; max-height:80vh; overflow:auto; padding:16px; position:relative; }
    .zoneBrowserTitle { font-size:16px; font-weight:700; margin:0 0 12px 0; }
    .zoneBrowserClose { position:absolute; top:10px; right:12px; background:none; border:none; font-size:20px; cursor:pointer; color:var(--muted); padding:4px 8px; }
    .zoneBrowserGrid { display:grid; grid-template-columns:repeat(auto-fill, minmax(100px, 1fr)); gap:10px; }
    .zoneBrowserGrid .cardImg { width:100%; height:auto; aspect-ratio:5/7; border-radius:8px; cursor:pointer; transition:transform 120ms ease; border:1px solid var(--border); }
    .zoneBrowserGrid .cardImg:hover { transform:scale(1.05); }
    .cardContextMenu { position:fixed; z-index:100; background:rgba(15,15,25,0.95); backdrop-filter:blur(8px); border:1px solid var(--w15); border-radius:8px; padding:4px 0; min-width:160px; box-shadow:0 8px 24px rgba(0,0,0,0.4); }
    .cardContextMenu .ctxItem { padding:8px 14px; color:rgba(255,255,255,0.8); font-size:12px; cursor:pointer; display:flex; align-items:center; gap:8px; }
    .cardContextMenu .ctxItem:hover { background:var(--w08); }
    .cardContextMenu .ctxDivider { height:1px; background:var(--w08); margin:4px 0; }
    .seatPanel.eliminated { opacity:0.4; filter:grayscale(0.5); pointer-events:none; }
    .seatDeathOverlay { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:56px; z-index:5; opacity:0.75; pointer-events:none; text-shadow:0 2px 12px rgba(0,0,0,0.6); }
    .cardWrap.staged { outline:2px dashed #fbbf24; outline-offset:2px; animation:stagePulse 1.2s ease-in-out infinite; }
    @keyframes stagePulse { 0%,100%{outline-color:rgba(251,191,36,0.8);} 50%{outline-color:rgba(251,191,36,0.3);} }
    .discardOverlay { position:absolute; inset:0; z-index:50; background:rgba(0,0,0,0.85); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; animation:gameOverIn 0.3s ease; }
    .discardPanel { background:rgba(30,30,50,0.95); border:1px solid rgba(239,68,68,0.4); border-radius:16px; padding:20px; max-width:600px; width:90%; max-height:80vh; overflow-y:auto; }
    .discardPanel h3 { color:#fff; font-size:16px; margin:0 0 4px 0; }
    .discardPanel .discardSub { color:rgba(255,255,255,0.6); font-size:12px; margin:0 0 14px 0; }
    .discardGrid { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-bottom:14px; }
    .discardGrid .discardCard { width:80px; height:112px; border-radius:6px; overflow:hidden; cursor:pointer; border:2px solid transparent; transition:all 120ms ease; position:relative; }
    .discardGrid .discardCard img { width:100%; height:100%; object-fit:cover; }
    .discardGrid .discardCard:hover { transform:translateY(-4px); }
    .discardGrid .discardCard.discardSelected { border-color:#ef4444; box-shadow:0 0 12px rgba(239,68,68,0.4); }
    .discardGrid .discardCard.discardSelected::after { content:'X'; position:absolute; top:2px; right:4px; color:#ef4444; font-weight:900; font-size:14px; text-shadow:0 1px 3px rgba(0,0,0,0.8); }
    .discardActions { display:flex; gap:8px; justify-content:center; }
    .eventLog { position:absolute; bottom:0; left:0; width:200px; max-height:180px; overflow-y:auto; z-index:18; background:rgba(10,10,20,0.85); backdrop-filter:blur(4px); border-top-right-radius:10px; border:1px solid var(--w1); padding:6px 8px; font-size:11px; }
    .eventLog.collapsed { max-height:26px; overflow:hidden; cursor:pointer; }
    .eventLogToggle { position:absolute; top:3px; right:6px; background:none; border:none; color:rgba(255,255,255,0.4); cursor:pointer; font-size:11px; padding:2px 4px; }
    .eventLogTitle { font-size:10px; font-weight:700; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.05em; margin:0 0 4px 0; }
    .eventEntry { color:rgba(255,255,255,0.65); padding:2px 0; border-bottom:1px solid rgba(255,255,255,0.05); line-height:1.3; }
    .zoneBadge.clickable { cursor:pointer; border:1px solid var(--border2); transition:background 120ms ease; }
    .zoneBadge.clickable:hover { background:rgba(18,21,26,0.08); }
    @media (max-width:980px) {
      .body { grid-template-columns:1fr; }
      .sidebar { border-right:none; border-bottom:1px solid var(--border); }
      .split { grid-template-columns:1fr; }
      .grid2,.list,.cols2 { grid-template-columns:1fr; }
      .cardModalContent { max-width:95vw; max-height:90vh; padding:16px; }
      .cardModalImg { max-height:45vh; width:auto; margin:0 auto; display:block; }
      .appRoot.matchActive .body { grid-template-columns:1fr; }
      .gameBoard { height:auto; min-height:100vh; border-radius:0; }
      .btn,.navBtn,.zoneBadge,.cardModalClose,.zoneBrowserClose,.inspectFloatClose { min-height:44px; min-width:44px; }
      .bfRow { flex-wrap:wrap; }
      .bfArea .cardWrap .cardImg { width:60px; height:84px; }
      .tokenTray { flex-direction:row; flex-wrap:wrap; align-self:auto; }
      .handTray { justify-content:flex-start; -webkit-overflow-scrolling:touch; }
      .handTray .cardImg { width:72px; height:100px; min-width:72px; flex:0 0 auto; }
      .turnBar { flex-wrap:wrap; gap:6px; padding:8px 10px; }
      .turnBar .turnActions { order:2; width:100%; display:flex; flex-wrap:wrap; gap:6px; justify-content:center; }
      .inspectFloat { position:fixed; top:auto; bottom:0; right:0; left:0; width:100%; border-radius:16px 16px 0 0; }
      .oppSide.multi { flex-direction:column; gap:4px; }
      .oppSide.multi .seatPanel { min-width:0; }
      .oppSide.multi .bfArea .cardImg { width:48px; height:66px; }
      .oppHandCard { width:36px; height:50px; border-radius:5px; }
      .oppSide.multi .oppHandCard { width:30px; height:42px; }
      .zoneBrowserContent { max-width:95vw; }
      .zoneBrowserGrid { grid-template-columns:repeat(auto-fill, minmax(72px, 1fr)); gap:6px; }
      .handMana .hmGem { width:20px; height:20px; }
      .handMana .hmText { font-size:12px; }
      .eventLogToggle { min-width:44px; min-height:44px; display:flex; align-items:center; justify-content:center; }
      .eventLog { width:180px; max-height:140px; font-size:10px; }
      .lifeBadge { min-height:36px; padding:6px 10px; }
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
      <div id="cardModalKeywords" class="cardModalKeywords"></div>
      <div id="cardModalWarn" class="cardModalWarn" style="display:none;"></div>
      <div id="cardModalAuras" class="cardModalAuras" style="display:none;"></div>
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
          <div class="navSectionTitle" style="margin:0 0 6px 0;">How Mana Works</div>
          <div class="manaExplainer">This game uses <b>auto-mana</b> \u2014 no land cards. You gain <b>1 mana crystal</b> each turn, up to <b>10</b>. Focus on your card curve and synergy instead of land draws.</div>
          <div class="manaExplainerTip">Tip: Low-cost cards let you play early. High-cost cards are stronger but come online later.</div>
          <div class="noteDisclaimer">Decks saved per-user \u00b7 Card data via Scryfall \u00b7 Standard legality enforced</div>
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

        <div id="tab-play" class="tabPanel">
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
                <option value="commander" id="cmdFormatOpt">Commander (3-5 players)</option>
              </select>
              <div id="cmdDesktopHint" style="display:none;font-size:11px;color:var(--muted);margin:-6px 0 8px 2px;">Commander requires desktop \u2014 too many players for mobile.</div>
              <div class="label">Opponent</div>
              <select id="playOpponent" class="select" style="margin-bottom:10px;">
                <option value="human">Another Sup user</option>
                <option value="bot">AI bot</option>
              </select>
              <div id="botOptions" style="display:none;margin-bottom:10px;">
                <div class="label">Bot difficulty</div>
                <select id="playBotDifficulty" class="select" style="margin-bottom:10px;">
                  <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                </select>
                <div class="label">Bot deck</div>
                <select id="playBotDeck" class="select"></select>
                <div class="small" style="margin-top:8px;color:var(--muted2);">Pick a deck for the bot, or leave on "Same as mine" to mirror your deck.</div>
              </div>
              <div id="cmdBotOptions" style="display:none;margin-bottom:10px;">
                <div class="label">Number of bots</div>
                <select id="cmdBotCount" class="select" style="margin-bottom:10px;">
                  <option value="1">1 bot (2 players)</option>
                  <option value="2">2 bots (3 players)</option>
                  <option value="3" selected>3 bots (4 players)</option>
                  <option value="4">4 bots (5 players)</option>
                </select>
                <div id="cmdBotSlots"></div>
                <div class="small" style="margin-top:8px;color:var(--muted2);">Each bot gets its own difficulty and deck. "Same as mine" mirrors your deck.</div>
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
                <button class="inspectFloatClose" id="inspectFloatClose" aria-label="Close card preview">&times;</button>
                <img id="inspectorImg" class="inspectorImg" width="180" height="252" decoding="async" />
                <div id="inspectorTitle" class="inspectorTitle"></div>
                <div id="inspectorSub" class="inspectorSub"></div>
                <button id="btnPlaySelected" class="btn btnPrimary">Play to battlefield</button>
                <button id="btnToGraveyard" class="btn">To graveyard</button>
                <button id="btnActivate" class="btn" style="display:none;">Activate ability</button>
                <button id="btnEquip" class="btn" style="display:none;">Equip</button>
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
        </div>

        <div id="tab-decks" class="tabPanel" style="display:none">
          <div class="row" style="margin-bottom:12px;">
            <div><div class="sectionTitle">Decks</div><div class="sectionSub">Your deck library.</div></div>
            <button id="btnNewDeck" class="btn btnPrimary">New Deck</button>
          </div>
          <div id="deckList" class="list"></div>
        </div>

        <div id="tab-builder" class="tabPanel" style="display:none">
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
        </div>
      </main>
    </div>
  </div>
</div>

<script>
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function clientBaseCardId(id) {
    if (typeof id !== 'string') return id;
    var idx = id.lastIndexOf(':');
    if (idx < 0) return id;
    var suffix = id.substring(idx + 1);
    if (/^\\d+$/.test(suffix)) return id.substring(0, idx);
    return id;
  }

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

  var CARD_BACK_URI = 'data:image/webp;base64,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dv++vUkf7h1ivHYYbkGlVVYAKqrbNLzKSLzhCGXcHILwZhe/zkSPq/7t+f+2f46xWU6bB5JVcpypgvwRYpQZ8wov8f+2tF309FKy/1lsQxMAxD2gAABYTVAgWwMAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDkuMS1jMDAyIDc5LmExY2QxMmY0MSwgMjAyNC8xMS8wOC0xNjowOToyMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpBQzAwNDJCMzcyQzhFMjExQUJEREY4NjA4NDlGRDFEOCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo0NjlBQjQwNDBBQjgxMUYxQUE4RDgyNERCRjVEQ0ZDRCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo0NjlBQjQwMzBBQjgxMUYxQUE4RDgyNERCRjVEQ0ZDRCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjg1OWM3MWRlLTE4ZDgtNGM3My1iYmNjLTFhNWEyMjcxMTQ0NiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4NTljNzFkZS0xOGQ4LTRjNzMtYmJjYy0xYTVhMjI3MTE0NDYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4A';
  var TREASURE_TOKEN_URI = 'data:image/webp;base64,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ZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOkFDMDA0MkIzNzJDOEUyMTFBQkRERjg2MDg0OUZEMUQ4IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjg3NDZGRDA0MEFCOTExRjFBREJGQjI3RkZGOUNFREM4IiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjg3NDZGRDAzMEFCOTExRjFBREJGQjI3RkZGOUNFREM4IiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NDY5QUI0MDMwQUI4MTFGMUFBOEQ4MjREQkY1RENGQ0QiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NDY5QUI0MDQwQUI4MTFGMUFBOEQ4MjREQkY1RENGQ0QiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4A';
  var GC = { LIFE_CRIT_STD: 5, LIFE_CRIT_CMD: 10 };
  var KW_TL = new Set(['Haste','Vigilance','Defender','Indestructible','Hexproof']);
  var KW_TR = new Set(['Flying','Reach','First Strike','Double Strike','Menace']);
  var KW_BL = new Set(['Trample','Deathtouch','Lifelink']);

  const state = {
    user: null, decks: [], activeTab: 'play', activeDeckId: null, activeDeck: null,
    activeMatchId: null, lastMatch: null, lastSearchResults: [], booting: false, booted: false,
    cardIndex: {}, selected: { id: null, zone: null, seat: null }, qsCommanderChosen: null,
    combatMode: null, pendingAttackers: {}, pendingBlockers: {}, selectedBlocker: null,
    targetingMode: null, modalSelection: null,
    lastLogIndex: 0, eventLogCollapsed: false,
    _suppressTurnOverlay: false, prevHandCounts: {},
    _atkStagedCreatures: [], discardSelection: null, quickMode: true,
    _hiddenBotCards: {}, _botAnimCounter: 0,
  };

  /* Tab buttons work immediately via event delegation — no boot() needed */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.tabBtn');
    if (btn && btn.dataset.tab) switchTab(btn.dataset.tab);
  });

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
    var names = ['play', 'decks', 'builder'];
    for (var i = 0; i < names.length; i++) {
      var el = document.getElementById('tab-' + names[i]);
      if (!el) continue;
      el.style.display = (names[i] === tab) ? '' : 'none';
    }
    $$('.tabBtn').forEach(btn => { btn.classList.toggle('active', btn.dataset.tab === tab); });
    var c = document.querySelector('.content'); if (c) c.scrollTop = 0;
  }

  function enterMatchMode() {
    document.querySelector('.appRoot').classList.add('matchActive');
    state.gameEntranceAnimated = false;
    switchTab('play');
    updateMatchBar();
  }

  function exitMatchMode() {
    document.querySelector('.appRoot').classList.remove('matchActive');
    state.activeMatchId = null;
    state.lastMatch = null;
    state.prevLifeBySeat = {};
    state.lastLogIndex = 0;
    state.gameEntranceAnimated = false;
    state.discardSelection = null;
    state._atkStagedCreatures = [];
    renderLobby(null);
    $('#gamePanel').style.display = 'none';
    $('#createResult').textContent = '';
    $('#joinResult').textContent = '';
  }

  async function playAgain() {
    var m = state.lastMatch;
    if (!m) { exitMatchMode(); return; }
    var format = m.format || 'standard';
    var deckId = m.decks?.[m.viewerSeat]?.deckId || null;
    var hasBots = (m.players || []).some(function(p) { return p.isBot; });
    var botDiff = null;
    if (hasBots) {
      var botP = (m.players || []).find(function(p) { return p.isBot; });
      botDiff = botP ? (botP.difficulty || 'easy') : 'easy';
    }
    if (!deckId) { exitMatchMode(); toast('Could not determine deck. Returning to menu.', { type: 'warn' }); return; }
    var opponent = hasBots ? { type: 'bot', difficulty: botDiff } : { type: 'human' };
    var payload = { format: format, hostDeckId: deckId, opponent: opponent };
    var res = await supExec('api_createMatch', payload);
    if (!res?.ok) { toast('Failed to create rematch: ' + (res?.error || 'unknown'), { type: 'error' }); return; }
    state.activeMatchId = res.matchId;
    state.prevLifeBySeat = {};
    toast('New match created!', { type: 'success', ms: 2000 });
    await refreshMatch();
    enterMatchMode();
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
    $('#playOpponent').disabled = false;
    const isBot = opp === 'bot';
    const isStandard = fmt === 'standard';
    $('#botOptions').style.display = (isBot && isStandard) ? '' : 'none';
    $('#cmdBotOptions').style.display = (isBot && !isStandard) ? '' : 'none';
    if (isBot && isStandard && !$('#playBotDifficulty').value) $('#playBotDifficulty').value = 'easy';
    if (isBot && !isStandard) renderCmdBotSlots();
    if (typeof updateDevPanel === 'function') updateDevPanel();
  }

  function renderCmdBotSlots() {
    const count = parseInt($('#cmdBotCount').value) || 3;
    const container = $('#cmdBotSlots');
    const format = $('#playFormat').value || 'commander';
    const playableDecks = state.decks.filter(function(d) { return d.format === format; });
    var html = '';
    for (var i = 0; i < count; i++) {
      var n = i + 1;
      html += '<div class="cmdBotSlot" data-bot-idx="' + i + '">';
      html += '<div class="slotLabel">Bot ' + n + '</div>';
      html += '<div class="slotRow">';
      html += '<select class="select cmdBotDiff" data-bot-idx="' + i + '">';
      html += '<option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>';
      html += '</select>';
      html += '<select class="select cmdBotDeck" data-bot-idx="' + i + '">';
      html += '<option value="">Same as mine</option>';
      for (var di = 0; di < playableDecks.length; di++) {
        var d = playableDecks[di];
        html += '<option value="' + escapeHtml(d.id) + '">' + escapeHtml(d.name || 'Untitled') + '</option>';
      }
      html += '</select>';
      html += '</div></div>';
    }
    container.innerHTML = html;
  }

  function getPlayConfig() {
    const format = $('#playFormat').value || 'standard';
    const opponentRaw = $('#playOpponent').value || 'human';
    const opponentType = opponentRaw;
    const deckId = $('#playDeck').value || null;
    const deckName = deckId ? ($('#playDeck').selectedOptions[0]?.textContent || null) : null;
    if (opponentType === 'bot' && format === 'standard') {
      const botDifficulty = $('#playBotDifficulty').value || 'easy';
      const botDeckId = $('#playBotDeck').value || null;
      return { format, opponentType, botDifficulty, botDeckId, deckId, deckName };
    }
    if (opponentType === 'bot' && format !== 'standard') {
      var bots = [];
      var slots = $$('.cmdBotSlot');
      for (var si = 0; si < slots.length; si++) {
        var diffSel = slots[si].querySelector('.cmdBotDiff');
        var deckSel = slots[si].querySelector('.cmdBotDeck');
        bots.push({ difficulty: diffSel ? diffSel.value : 'easy', deckId: deckSel ? (deckSel.value || null) : null });
      }
      return { format, opponentType, bots, deckId, deckName };
    }
    return { format, opponentType, botDifficulty: null, botDeckId: null, deckId, deckName };
  }

  const _devState = { clicks: 0, clickTimer: null, active: false, lastPayload: null, lastResponse: null };

  function initDevPanel() {
    try {
      const saved = sessionStorage.getItem('mtg.devPanel');
      if (saved === 'active') { _devState.active = true; $('#devPanel').classList.add('visible'); $('#devToggle').classList.add('active'); updateDevPanel(); }
    } catch(e) { /* sessionStorage may be unavailable */ }
  }

  function toggleDevPanel() {
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
    const botDeckSel = $('#playBotDeck');
    if (botDeckSel) {
      const prevBotDeck = botDeckSel.value;
      botDeckSel.innerHTML = '';
      const mirrorOpt = document.createElement('option');
      mirrorOpt.value = '';
      mirrorOpt.textContent = 'Same as mine';
      botDeckSel.appendChild(mirrorOpt);
      for (const deck of playableDecks) {
        const opt = document.createElement('option');
        opt.value = deck.id;
        opt.textContent = deck.name || 'Untitled';
        botDeckSel.appendChild(opt);
      }
      if (prevBotDeck && playableDecks.some(d => d.id === prevBotDeck)) botDeckSel.value = prevBotDeck;
    }
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
    state.activeDeck.cardMeta[id] = { name: card.name, typeLine: card.typeLine, cmc: Number(card.cmc) || 0, power: card.power || null, toughness: card.toughness || null, keywords: Array.isArray(card.keywords) ? card.keywords : [], oracleText: card.oracleText || '' };
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
    state.activeDeck.cardMeta[card.id] = { name: card.name, typeLine: card.typeLine, cmc: Number(card.cmc) || 0, power: card.power || null, toughness: card.toughness || null, keywords: Array.isArray(card.keywords) ? card.keywords : [], oracleText: card.oracleText || '' };
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
      if (deck?.ok === false) { $('#qsStandardMsg').textContent = 'Failed: ' + (deck.error || 'unknown'); toast(deck.error || 'Deck creation failed', { type: 'error' }); return; }
      await loadDecks();
      if (deck?.id) { setActiveDeck(deck.id); $('#builderDeck').value = deck.id; }
      $('#qsStandardMsg').textContent = '';
      toast((deck?.name || 'Quickstart deck') + ' added to your decks.', { type: 'success', ms: 3000 }); switchTab('decks');
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
      if (deck?.ok === false) { $('#qsCommanderMsg').textContent = 'Failed: ' + (deck.error || 'unknown'); toast(deck.error || 'Deck creation failed', { type: 'error' }); return; }
      await loadDecks();
      if (deck?.id) { setActiveDeck(deck.id); $('#builderDeck').value = deck.id; }
      $('#qsCommanderMsg').textContent = '';
      toast((deck?.name || 'Commander deck') + ' added to your decks.', { type: 'success', ms: 3000 }); switchTab('decks');
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
      if (deck?.ok === false) { $('#qsCommanderMsg').textContent = 'Failed: ' + (deck.error || 'unknown'); toast(deck.error || 'Deck creation failed', { type: 'error' }); return; }
      await loadDecks();
      if (deck?.id) { setActiveDeck(deck.id); $('#builderDeck').value = deck.id; }
      $('#qsCommanderMsg').textContent = '';
      toast((deck?.name || 'Commander deck') + ' added to your decks.', { type: 'success', ms: 3000 }); switchTab('decks');
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
    if (config.format === 'commander' && state.isMobile) { toast('Commander is desktop only.', { type: 'warn' }); return; }
    if (!config.deckId) { $('#createResult').textContent = 'No deck selected.'; toast('No deck selected.', { type: 'warn' }); return; }
    if (config.opponentType === 'bot' && config.format === 'standard' && !config.botDifficulty) { $('#createResult').textContent = 'Bot difficulty not set.'; toast('Bot difficulty not set.', { type: 'warn' }); return; }
    if (config.opponentType === 'bot' && config.format !== 'standard' && (!config.bots || !config.bots.length)) { $('#createResult').textContent = 'No bots configured.'; toast('No bots configured.', { type: 'warn' }); return; }
    $('#createResult').textContent = 'Creating match\u2026';
    var opponent;
    if (config.opponentType === 'bot' && config.bots) {
      opponent = { type: 'bot', bots: config.bots };
    } else if (config.opponentType === 'bot') {
      opponent = { type: 'bot', difficulty: config.botDifficulty, deckId: config.botDeckId || null };
    } else {
      opponent = { type: 'human' };
    }
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
    state._lobbyPrefetchDone = false;
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
    state._lobbyPrefetchDone = false;
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

  // Prefetch Scryfall data for all decks in the match during lobby (background)
  async function lobbyPrefetchCards(match) {
    if (!match?.decks || state._lobbyPrefetchDone) return;
    state._lobbyPrefetchDone = true;
    // Collect all unique card IDs across all decks in the match
    var allCardIds = [];
    for (var seat in match.decks) {
      var deckCards = match.decks[seat]?.cards;
      if (deckCards && typeof deckCards === 'object') {
        var ids = Object.keys(deckCards);
        for (var i = 0; i < ids.length; i++) allCardIds.push(ids[i]);
      }
      if (match.decks[seat]?.commander) allCardIds.push(match.decks[seat].commander);
    }
    var unique = [];
    var seen = {};
    for (var j = 0; j < allCardIds.length; j++) {
      if (!seen[allCardIds[j]]) { seen[allCardIds[j]] = true; unique.push(allCardIds[j]); }
    }
    if (!unique.length) return;
    // Filter to only IDs not already in cardIndex
    var missing = unique.filter(function(id) { return !state.cardIndex[id]; });
    if (!missing.length) return;
    try {
      var res = await supExec('api_getCardsBulk', { ids: missing });
      if (res?.byId) state.cardIndex = Object.assign({}, state.cardIndex, res.byId);
    } catch (e) { /* non-fatal — will be fetched later during hydration */ }
  }

  function renderLobby(match) {
    const panel = $('#lobbyPanel');
    const has = !!match && !!state.activeMatchId;
    const inGame = has && (match.phase === 'playing' || match.phase === 'finished' || match.phase === 'mulligan');
    panel.style.display = (has && !inGame) ? '' : 'none';
    if (!has || inGame) return;
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
      const deckName = (deckAssigned && match.decks[p.seat]?.name) ? escapeHtml(match.decks[p.seat].name) : null;
      const deckLabel = deckAssigned ? (deckName || 'Deck assigned') : 'No deck';
      row.innerHTML = '<div style="min-width:0; flex: 1;"><div style="font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Seat ' + p.seat + ': ' + who + hostBadge + '</div><div class="small">' + deckLabel + (isBot && p.difficulty ? (' \u2022 ' + escapeHtml(p.difficulty)) : '') + ' \u2022 ' + (ready ? '<span style="color:var(--success);font-weight:700;">Ready</span>' : '<span style="color:var(--muted);">Not ready</span>') + '</div></div>';
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
    var allPlayersReady = (match.players || []).every(function(p) { return !!readyBy[p.userId]; });
    var btnReady = $('#btnReady');
    var btnStart = $('#btnStartGame');
    btnReady.textContent = isReady ? 'Unready' : 'Ready';
    if (allPlayersReady) {
      btnReady.className = 'btn'; btnReady.style.width = '100%'; btnReady.style.marginTop = '10px';
      btnStart.className = 'btn btnPrimary'; btnStart.style.background = '';
    } else {
      btnReady.className = 'btn btnPrimary'; btnReady.style.width = '100%'; btnReady.style.marginTop = '10px';
      btnStart.className = 'btn'; btnStart.style.background = 'rgba(255,255,255,0.9)';
    }
    const isHost = match.hostUserId === state.user?.id;
    btnStart.disabled = !isHost || match.phase !== 'lobby';
    const me = (match.players || []).find(p => p.userId === state.user?.id);
    if (me && match.decks && match.decks[me.seat]) { const assigned = match.decks[me.seat].deckId; if (assigned) $('#assignDeckSelect').value = assigned; }
    // Prefetch card data for all decks in the background while players ready up
    lobbyPrefetchCards(match);
  }

  function renderMulliganOverlay(match) {
    var overlay = document.createElement('div');
    overlay.className = 'mulliganOverlay';

    var title = document.createElement('div');
    title.className = 'mulliganTitle';
    title.textContent = 'Your Opening Hand';
    overlay.appendChild(title);

    var banner = document.createElement('div');
    banner.className = 'mulliganBanner';
    banner.innerHTML = '<b>No lands?</b> That\\u2019s by design. Mana is <b>automatic</b> \\u2014 you gain <b>1 crystal</b> each turn (up to 10). Focus on your card curve and synergy.';
    overlay.appendChild(banner);

    var handDisplay = document.createElement('div');
    handDisplay.className = 'mulliganHandDisplay';
    handDisplay.id = 'mulliganOverlayHand';
    overlay.appendChild(handDisplay);

    var controls = document.createElement('div');
    controls.className = 'mulliganControls';

    var badge = document.createElement('div');
    badge.className = 'mulliganCountBadge';
    badge.id = 'mulliganOverlayBadge';
    badge.style.display = 'none';
    controls.appendChild(badge);

    var keepBtn = document.createElement('button');
    keepBtn.className = 'btn btnPrimary';
    keepBtn.id = 'btnKeepOverlay';
    keepBtn.textContent = 'Keep Hand';
    keepBtn.onclick = function() { keepHand(); };
    controls.appendChild(keepBtn);

    var mullBtn = document.createElement('button');
    mullBtn.className = 'btn';
    mullBtn.id = 'btnMulliganOverlay';
    mullBtn.textContent = 'Mulligan';
    mullBtn.style.background = 'rgba(255,255,255,0.12)';
    mullBtn.style.color = 'rgba(255,255,255,0.85)';
    mullBtn.style.borderColor = 'rgba(255,255,255,0.2)';
    mullBtn.onclick = function() { mulligan(); };
    controls.appendChild(mullBtn);

    overlay.appendChild(controls);

    var status = document.createElement('div');
    status.className = 'mulliganStatusMsg';
    status.id = 'mulliganOverlayStatus';
    overlay.appendChild(status);

    return overlay;
  }

  function updateMulliganOverlay(match) {
    var overlay = document.querySelector('#gameBoard .mulliganOverlay');
    if (!overlay) return;
    var seat = match.viewerSeat;
    var mulligansTaken = Number(match?.game?.mulligansBySeat?.[seat] || 0);
    var kept = !!match?.game?.keptBySeat?.[seat];

    // Update hand cards
    var handDisplay = overlay.querySelector('#mulliganOverlayHand');
    if (handDisplay) {
      handDisplay.innerHTML = '';
      var myZones = match?.game?.zones?.[seat];
      var handCards = Array.isArray(myZones?.hand) ? myZones.hand : [];
      if (handCards.length) {
        for (var i = 0; i < handCards.length; i++) {
          handDisplay.appendChild(renderCardImg(handCards[i], { zone: 'hand', seat: seat, w: 120, h: 168 }));
        }
      } else {
        handDisplay.innerHTML = '<div style="color:rgba(255,255,255,0.4);font-size:13px;">No cards in hand.</div>';
      }
    }

    // Update badge
    var badge = overlay.querySelector('#mulliganOverlayBadge');
    if (badge) {
      if (mulligansTaken > 0) {
        badge.style.display = '';
        badge.textContent = 'Mulligans: ' + mulligansTaken;
        badge.className = 'mulliganCountBadge warning';
      } else {
        badge.style.display = 'none';
      }
    }

    // Update buttons
    var keepBtn = overlay.querySelector('#btnKeepOverlay');
    var mullBtn = overlay.querySelector('#btnMulliganOverlay');
    if (keepBtn) keepBtn.disabled = kept;
    if (mullBtn) mullBtn.disabled = kept;

    // Update status
    var statusEl = overlay.querySelector('#mulliganOverlayStatus');
    if (statusEl) {
      var allKept = !!match?.game?.keptBySeat && Object.values(match.game.keptBySeat).every(Boolean);
      statusEl.textContent = allKept ? 'All players kept \\u2014 game starting\\u2026' : (kept ? 'Waiting for other players\\u2026' : '');
    }
  }

  function cardMeta(id) { return state.cardIndex?.[id] || state.cardIndex?.[clientBaseCardId(id)] || null; }
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
    // Strip instance suffixes before sending to Scryfall (e.g. "abc:0" → "abc")
    var baseIds = uniq(missing.map(clientBaseCardId));
    var baseMissing = baseIds.filter(id => !state.cardIndex[id]);
    if (baseMissing.length) {
      const res = await supExec('api_getCardsBulk', { ids: baseMissing });
      state.cardIndex = { ...state.cardIndex, ...(res?.byId || {}) };
    }
    // Populate instance IDs from base IDs
    for (var mi = 0; mi < missing.length; mi++) {
      var mid = missing[mi];
      if (!state.cardIndex[mid]) {
        var bid = clientBaseCardId(mid);
        if (state.cardIndex[bid]) state.cardIndex[mid] = state.cardIndex[bid];
      }
    }
    // Tokens don't have Scryfall data — populate from match deck meta
    var allZones = match?.game?.zones || {};
    for (var hSeat in allZones) {
      var tokenMeta = match?.decks?.[hSeat]?.cardMeta || {};
      for (var tid in tokenMeta) {
        if (tokenMeta[tid].isToken && !state.cardIndex[tid]) {
          state.cardIndex[tid] = tokenMeta[tid];
        }
      }
    }
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
      $('#btnActivate').style.display = 'none';
      $('#btnEquip').style.display = 'none';
      return;
    }
    if (panel) panel.classList.add('visible');
    var selIsToken = c?.isToken || (typeof state.selected.id === 'string' && state.selected.id.indexOf('tok_') === 0);
    var selImgSrc = c.imageNormal || c.imageSmall || '';
    if (!selImgSrc && selIsToken && (c?.name || '').toLowerCase().includes('treasure')) selImgSrc = TREASURE_TOKEN_URI;
    img.src = selImgSrc;
    title.textContent = c.name || state.selected.id;
    const cmcStr = c.cmc != null ? ' \u2022 ' + c.cmc + ' mana' : '';
    sub.textContent = (c.typeLine || '') + cmcStr + (state.selected.zone ? ' \u2022 ' + state.selected.zone : '');
    var playBtn = $('#btnPlaySelected');
    var canPlay = state.selected.zone === 'hand' && state.selected.seat === state.lastMatch?.viewerSeat && clientCanPlay(state.selected.id, state.lastMatch);
    playBtn.disabled = !canPlay;
    if (state.selected.zone === 'hand') {
      var ct = clientCardType(state.selected.id);
      playBtn.textContent = (ct === 'instant' || ct === 'sorcery') ? 'Cast spell' : 'Play to battlefield';
    }
    $('#btnToGraveyard').disabled = !(state.selected.zone === 'battlefield' && state.selected.seat === state.lastMatch?.viewerSeat);
    var activateBtn = $('#btnActivate');
    if (state.selected.zone === 'battlefield' && state.selected.seat === state.lastMatch?.viewerSeat) {
      var selOracle = String(cardMeta(state.selected.id)?.oracleText || '');
      var selTypeLine = String(cardMeta(state.selected.id)?.typeLine || '').toLowerCase();
      var hasActivatable = /sacrifice.*add.*mana/i.test(selOracle);
      // Class enchantment level-up
      if (selTypeLine.includes('class')) {
        var selClassState = state.lastMatch?.game?.cardState?.[state.selected.id];
        var selClassLvl = (selClassState && selClassState.classLevel) || 1;
        if (selClassLvl < 3) {
          var selNextLvl = selClassLvl + 1;
          var selLvlPattern = /((?:\\{[^}]+\\})+)\\s*:\\s*Level\\s+(\\d+)/gi;
          var selLvlMatch; var selLvlCost = null;
          while ((selLvlMatch = selLvlPattern.exec(selOracle)) !== null) {
            if (parseInt(selLvlMatch[2]) === selNextLvl) { selLvlCost = selLvlMatch[1]; break; }
          }
          if (selLvlCost) {
            hasActivatable = true;
            activateBtn.textContent = 'Level Up to ' + selNextLvl + ' (' + selLvlCost.replace(/\\{/g, '').replace(/\\}/g, ' ').trim() + ')';
          }
        }
      } else {
        activateBtn.textContent = 'Activate ability';
      }
      activateBtn.style.display = hasActivatable ? '' : 'none';
      activateBtn.disabled = !hasActivatable;
    } else {
      activateBtn.style.display = 'none';
    }
    // Equip button for equipment on battlefield
    var equipBtn = $('#btnEquip');
    if (state.selected.zone === 'battlefield' && state.selected.seat === state.lastMatch?.viewerSeat && clientIsEquipment(state.selected.id)) {
      var selEqCost = clientParseEquipCost(state.selected.id);
      if (selEqCost !== null) {
        var eqMana = state.lastMatch?.game?.manaBySeat?.[state.lastMatch.viewerSeat] || { current: 0 };
        equipBtn.textContent = 'Equip (' + selEqCost + ' mana)';
        equipBtn.style.display = '';
        equipBtn.disabled = eqMana.current < selEqCost;
      } else {
        equipBtn.style.display = 'none';
      }
    } else {
      equipBtn.style.display = 'none';
    }
    $('#btnInspect').disabled = !c;
    $$('.cardImg[data-card-id="' + state.selected.id + '"]').forEach(el => el.classList.add('selected'));
  }

  function showCardContextMenu(ev, cardId, zone, seat) {
    ev.preventDefault();
    // Remove any existing context menu
    var existing = document.querySelector('.cardContextMenu');
    if (existing) existing.remove();
    var menu = document.createElement('div');
    menu.className = 'cardContextMenu';
    // Inspect option (always available)
    var inspectItem = document.createElement('div');
    inspectItem.className = 'ctxItem';
    inspectItem.textContent = 'Inspect';
    inspectItem.onclick = function() { menu.remove(); openCardModal(cardId, zone); };
    menu.appendChild(inspectItem);
    // Battlefield-only options for viewer's cards
    if (zone === 'battlefield' && seat === state.lastMatch?.viewerSeat) {
      var ctxOracle = String(cardMeta(cardId)?.oracleText || '');
      // Class enchantment level-up
      var ctxTypeLine = String(cardMeta(cardId)?.typeLine || '').toLowerCase();
      if (ctxTypeLine.includes('class')) {
        var ctxClassState = state.lastMatch?.game?.cardState?.[cardId];
        var ctxClassLevel = (ctxClassState && ctxClassState.classLevel) || 1;
        if (ctxClassLevel < 3) {
          var ctxNextLvl = ctxClassLevel + 1;
          var ctxLvlPattern = /((?:\\{[^}]+\\})+)\\s*:\\s*Level\\s+(\\d+)/gi;
          var ctxLvlMatch; var ctxLvlCost = null;
          while ((ctxLvlMatch = ctxLvlPattern.exec(ctxOracle)) !== null) {
            if (parseInt(ctxLvlMatch[2]) === ctxNextLvl) { ctxLvlCost = ctxLvlMatch[1]; break; }
          }
          if (ctxLvlCost) {
            var dividerLvl = document.createElement('div');
            dividerLvl.className = 'ctxDivider';
            menu.appendChild(dividerLvl);
            var lvlItem = document.createElement('div');
            lvlItem.className = 'ctxItem';
            lvlItem.textContent = 'Level Up to ' + ctxNextLvl + ' (' + ctxLvlCost.replace(/\\{/g, '').replace(/\\}/g, ' ').trim() + ')';
            lvlItem.onclick = async function() {
              menu.remove();
              var res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'ACTIVATE_ABILITY', cardId: cardId } });
              if (!res.ok) { toast('Level up failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
              toast((cardMeta(cardId)?.name || 'Card') + ' leveled up!', { type: 'success', ms: 1500 });
              await refreshMatch(); setSelected(null);
            };
            menu.appendChild(lvlItem);
          }
        }
      }
      // Activate ability (e.g. Treasure sacrifice)
      if (/sacrifice.*add.*mana/i.test(ctxOracle)) {
        var divider0 = document.createElement('div');
        divider0.className = 'ctxDivider';
        menu.appendChild(divider0);
        var actItem = document.createElement('div');
        actItem.className = 'ctxItem';
        actItem.textContent = 'Activate Ability';
        actItem.onclick = async function() {
          menu.remove();
          var res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'ACTIVATE_ABILITY', cardId: cardId } });
          if (!res.ok) { toast('Activate failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
          toast((cardMeta(cardId)?.name || 'Card') + ' ability activated!', { type: 'success', ms: 1500 });
          await refreshMatch(); setSelected(null);
        };
        menu.appendChild(actItem);
      }
      // Scry / look at top: context menu option
      if (/scry\\s+\\d+/i.test(ctxOracle) || /look\\s+at\\s+the\\s+top/i.test(ctxOracle)) {
        var dividerScry = document.createElement('div');
        dividerScry.className = 'ctxDivider';
        menu.appendChild(dividerScry);
        var scryItem = document.createElement('div');
        scryItem.className = 'ctxItem';
        var scryLabel = 'Scry';
        var scryAmtMatch = /scry\\s+(\\d+)/i.exec(ctxOracle);
        var lookTopAmtMatch = /look\\s+at\\s+the\\s+top\\s+(\\w+)\\s+cards?/i.exec(ctxOracle);
        if (scryAmtMatch) scryLabel = 'Scry ' + scryAmtMatch[1];
        else if (lookTopAmtMatch) scryLabel = 'Look at top ' + lookTopAmtMatch[1];
        scryItem.textContent = scryLabel;
        scryItem.onclick = async function() {
          menu.remove();
          var res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'ACTIVATE_ABILITY', cardId: cardId } });
          if (!res.ok) { toast('Scry failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
          await refreshMatch();
          // After refreshMatch, scryPending is set — renderGame will show the overlay
          setSelected(null);
        };
        menu.appendChild(scryItem);
      }
      // Equipment: Equip option
      if (clientIsEquipment(cardId)) {
        var equipCost = clientParseEquipCost(cardId);
        if (equipCost !== null) {
          var match = state.lastMatch;
          var mySeat = match?.viewerSeat;
          var myMana = match?.game?.manaBySeat?.[mySeat] || { current: 0 };
          var canAfford = myMana.current >= equipCost;
          var dividerEq = document.createElement('div');
          dividerEq.className = 'ctxDivider';
          menu.appendChild(dividerEq);
          var equipItem = document.createElement('div');
          equipItem.className = 'ctxItem';
          equipItem.textContent = 'Equip (' + equipCost + ' mana)';
          if (!canAfford) { equipItem.style.opacity = '0.4'; equipItem.style.pointerEvents = 'none'; }
          equipItem.onclick = function() {
            menu.remove();
            enterEquipTargetingMode(cardId, equipCost);
          };
          menu.appendChild(equipItem);
        }
      }
      var divider = document.createElement('div');
      divider.className = 'ctxDivider';
      menu.appendChild(divider);
      var gyItem = document.createElement('div');
      gyItem.className = 'ctxItem';
      gyItem.textContent = 'Send to Graveyard';
      gyItem.onclick = async function() {
        menu.remove();
        var res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'MOVE_BATTLEFIELD_TO_GRAVEYARD', cardId: cardId } });
        if (!res.ok) { toast('Move failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
        await refreshMatch(); setSelected(null);
      };
      menu.appendChild(gyItem);
    }
    // Position at click location
    menu.style.left = Math.min(ev.clientX, window.innerWidth - 180) + 'px';
    menu.style.top = Math.min(ev.clientY, window.innerHeight - 100) + 'px';
    document.body.appendChild(menu);
    // Close on click outside
    var closeMenu = function(e) { if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', closeMenu); } };
    setTimeout(function() { document.addEventListener('click', closeMenu); }, 0);
  }

  function openCardModal(cardId, zone) {
    const c = cardMeta(cardId);
    if (!c) return;
    var modalIsToken = c?.isToken || (typeof cardId === 'string' && cardId.indexOf('tok_') === 0);
    var modalImgSrc = c.imageNormal || c.imageSmall || '';
    if (!modalImgSrc && modalIsToken && (c?.name || '').toLowerCase().includes('treasure')) modalImgSrc = TREASURE_TOKEN_URI;
    $('#cardModalImg').src = modalImgSrc;
    $('#cardModalImg').alt = c.name || cardId;
    $('#cardModalName').textContent = c.name || cardId;
    $('#cardModalMana').textContent = c.manaCost || '';
    $('#cardModalMana').style.display = c.manaCost ? '' : 'none';
    $('#cardModalType').textContent = c.typeLine || '';
    $('#cardModalOracle').textContent = c.oracleText || 'No oracle text.';
    // Keyword pills
    var kwContainer = $('#cardModalKeywords');
    kwContainer.innerHTML = '';
    var kws = clientGetKeywords(cardId);
    for (var ki = 0; ki < kws.length; ki++) {
      var pill = document.createElement('span');
      var isSupported = CLIENT_SUPPORTED_KEYWORDS.indexOf(kws[ki]) >= 0;
      pill.className = isSupported ? 'kwPill' : 'kwPill kwPillUnsupported';
      pill.textContent = kws[ki];
      kwContainer.appendChild(pill);
    }
    // Unsupported ability warning
    var warnEl = $('#cardModalWarn');
    warnEl.style.display = 'none';
    var oracle = String(c.oracleText || '');
    var tl = String(c.typeLine || '').toLowerCase();
    if (tl.includes('creature') && oracle.length > 0) {
      var abilityPatterns = /\\b(when|whenever|at the beginning|sacrifice|create|counter|destroy|exile|return|put|search|discard|draw|gain|lose|pay|tap|untap|transform|equip|attach|enchant|fight|mill|scry|surveil|venture|explore|populate|proliferate|amass|adapt|monstrosity|ward|protection from|shroud|flash|wither|infect|persist|undying|affinity|cascade|convoke|delve|emerge|mutate|dash|evoke|ninjutsu|prowl|bestow|morph|kicker|madness|aftermath|fuse|overload|splice|entwine|escalate|strive|devour|exploit|fabricate|extort|tribute|riot|spectacle|escape|foretell|disturb|daybound|nightbound|champion|changeling|living weapon)\\b/i;
      if (abilityPatterns.test(oracle)) {
        warnEl.textContent = '\u26A0 This creature has abilities the engine does not yet simulate. It plays as a vanilla creature with its keyword abilities.';
        warnEl.style.display = '';
      }
    }
    // Aura info
    var auraInfoEl = $('#cardModalAuras');
    auraInfoEl.innerHTML = ''; auraInfoEl.style.display = 'none';
    var match = state.lastMatch;
    if (match && zone === 'battlefield') {
      var auraAtch = match?.game?.auraAttachments || {};
      // If inspecting a creature, show auras attached to it
      if (clientCardType(cardId) === 'creature') {
        var attachedAuras = [];
        for (var auraId in auraAtch) { if (auraAtch[auraId] === cardId) attachedAuras.push(auraId); }
        if (attachedAuras.length) {
          var auraHtml = '<strong>Enchanted by:</strong> ';
          for (var ai = 0; ai < attachedAuras.length; ai++) {
            var aMeta = cardMeta(attachedAuras[ai]);
            var aMods = clientParseAuraMods(attachedAuras[ai]);
            var modStr = '';
            if (aMods.power !== 0 || aMods.toughness !== 0) modStr = ' (' + (aMods.power >= 0 ? '+' : '') + aMods.power + '/' + (aMods.toughness >= 0 ? '+' : '') + aMods.toughness + ')';
            if (ai > 0) auraHtml += ', ';
            auraHtml += escapeHtml(aMeta?.name || attachedAuras[ai]) + modStr;
          }
          auraInfoEl.innerHTML = auraHtml; auraInfoEl.style.display = '';
        }
      }
      // If inspecting an aura, show what it's attached to
      if (clientIsAura(cardId) && auraAtch[cardId]) {
        var tgtMeta = cardMeta(auraAtch[cardId]);
        auraInfoEl.innerHTML = '<strong>Attached to:</strong> ' + escapeHtml(tgtMeta?.name || auraAtch[cardId]);
        auraInfoEl.style.display = '';
      }
    }
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

  function clientCanPlay(id, match) {
    if (!match || match.game?.status === 'finished') return false;
    var mySeat = match.viewerSeat;
    // Block all plays while scry or discard is pending — must resolve first
    if (match.game?.scryPending && match.game.scryPending.seat === mySeat) return false;
    if (match.game?.discardPending && match.game.discardPending.seat === mySeat) return false;
    var mana = match.game?.manaBySeat?.[mySeat] || { current: 0, max: 0 };
    var cmc = Number(cardMeta(id)?.cmc) || 0;
    if (cmc > mana.current) return false;
    // Instants: playable during own main phases OR during response window
    if (clientCardType(id) === 'instant') {
      var rw = match.game?.responseWindow;
      if (rw && rw.seat === mySeat) return true;
    }
    // All cards: playable during own main phase
    if (match.game?.activePlayerSeat !== mySeat) return false;
    var step = match.game?.step || '';
    if (step !== 'main1' && step !== 'main2') return false;
    return true;
  }

  var CLIENT_SUPPORTED_KEYWORDS = ['Flying','Reach','First Strike','Double Strike','Trample','Deathtouch','Lifelink','Haste','Vigilance','Defender','Menace','Indestructible','Hexproof'];

  function clientGetKeywords(id) {
    var c = cardMeta(id);
    return (c && Array.isArray(c.keywords)) ? c.keywords : [];
  }
  function clientHasKeyword(id, keyword) {
    var kws = clientGetKeywords(id);
    for (var i = 0; i < kws.length; i++) { if (kws[i] === keyword) return true; }
    return false;
  }
  function clientCanBlock(blockerId, attackerId) {
    if (clientHasKeyword(attackerId, 'Flying') && !clientHasKeyword(blockerId, 'Flying') && !clientHasKeyword(blockerId, 'Reach')) return false;
    // Menace checked at group level in confirmBlockers, not per-blocker
    return true;
  }

  function clientIsAura(id) {
    var tl = String(cardMeta(id)?.typeLine || '').toLowerCase();
    return tl.includes('enchantment') && tl.includes('aura');
  }

  function clientParseAuraMods(id) {
    var c = cardMeta(id);
    var oracle = String(c?.oracleText || '');
    var pw = 0; var tw = 0;
    var re = /([+-]\\d+)\\/([+-]\\d+)/g;
    var m;
    while ((m = re.exec(oracle)) !== null) { pw += parseInt(m[1], 10); tw += parseInt(m[2], 10); }
    return { power: pw, toughness: tw };
  }

  function clientGetAurasOnCreature(creatureId, match) {
    var auras = match?.game?.auraAttachments || {};
    var result = [];
    for (var auraId in auras) { if (auras[auraId] === creatureId) result.push(auraId); }
    return result;
  }

  function clientGetAuraBuffs(creatureId, match) {
    var auraIds = clientGetAurasOnCreature(creatureId, match);
    var pw = 0; var tw = 0;
    for (var i = 0; i < auraIds.length; i++) {
      var mods = clientParseAuraMods(auraIds[i]);
      pw += mods.power; tw += mods.toughness;
    }
    return { power: pw, toughness: tw, count: auraIds.length };
  }

  function clientIsEquipment(id) {
    var tl = String(cardMeta(id)?.typeLine || '').toLowerCase();
    return tl.includes('equipment');
  }

  function clientParseEquipmentMods(id) {
    var oracle = String(cardMeta(id)?.oracleText || '');
    var pw = 0; var tw = 0;
    var re = /equipped creature gets\\s+([+-]\\d+)\\/([+-]\\d+)/gi;
    var m;
    while ((m = re.exec(oracle)) !== null) { pw += parseInt(m[1], 10); tw += parseInt(m[2], 10); }
    // Also match "Equip" static buffs like "+2/+0" without "equipped creature gets"
    if (pw === 0 && tw === 0) {
      var re2 = /([+-]\\d+)\\/([+-]\\d+)/g;
      while ((m = re2.exec(oracle)) !== null) { pw += parseInt(m[1], 10); tw += parseInt(m[2], 10); }
    }
    return { power: pw, toughness: tw };
  }

  function clientParseEquipCost(id) {
    var oracle = String(cardMeta(id)?.oracleText || '');
    var re = /equip\\s*(?:\\{(\\d+)\\}|(\\d+))/i;
    var m = re.exec(oracle);
    if (m) return parseInt(m[1] || m[2], 10);
    return null;
  }

  function clientGetEquipmentOnCreature(creatureId, match) {
    var eqs = match?.game?.equipmentAttachments || {};
    var result = [];
    for (var eqId in eqs) { if (eqs[eqId] === creatureId) result.push(eqId); }
    return result;
  }

  function clientGetEquipmentBuffs(creatureId, match) {
    var eqIds = clientGetEquipmentOnCreature(creatureId, match);
    var pw = 0; var tw = 0;
    for (var i = 0; i < eqIds.length; i++) {
      var mods = clientParseEquipmentMods(eqIds[i]);
      pw += mods.power; tw += mods.toughness;
    }
    return { power: pw, toughness: tw, count: eqIds.length };
  }

  function clientMatchesTypeFilter(id, filterType) {
    // Check typeLine directly — multi-type cards (Artifact Creature, Enchantment Creature) match all their types
    var tl = String(cardMeta(id)?.typeLine || '').toLowerCase();
    if (filterType === 'creature') return tl.includes('creature');
    if (filterType === 'artifact') return tl.includes('artifact');
    if (filterType === 'enchantment') return tl.includes('enchantment');
    if (filterType === 'permanent') return true;
    if (filterType === 'nonland permanent') return !tl.includes('land') || tl.includes('creature') || tl.includes('artifact') || tl.includes('enchantment');
    return tl.includes(filterType);
  }

  function getTargetablePermanents(match, casterSeat, typeFilter) {
    var targets = [];
    var seats = (match.players || []).map(function(p) { return p.seat; });
    for (var si = 0; si < seats.length; si++) {
      var s = seats[si];
      var bf = match?.game?.zones?.[s]?.battlefield || [];
      for (var ci = 0; ci < bf.length; ci++) {
        var cid = bf[ci];
        if (typeFilter && !clientMatchesTypeFilter(cid, typeFilter)) continue;
        if (s !== casterSeat && clientHasKeyword(cid, 'Hexproof')) continue;
        targets.push(cid);
      }
    }
    return targets;
  }

  function getTargetableCreatures(match, casterSeat) {
    return getTargetablePermanents(match, casterSeat, 'creature');
  }

  function enterTargetingMode(cardId) {
    var match = state.lastMatch;
    if (!match) return;
    var mySeat = match.viewerSeat;
    var targets = getTargetableCreatures(match, mySeat);
    if (!targets.length) {
      toast('No valid creature targets on the battlefield.', { type: 'warn', ms: 2000 });
      return;
    }
    state.targetingMode = { cardId: cardId, validTargets: targets, selectedTarget: null };
    renderGame(match);
  }

  function handleTargetClick(cardId) {
    if (!state.targetingMode) return;
    if (state.targetingMode.validTargets.indexOf(cardId) < 0) return;
    state.targetingMode.selectedTarget = cardId;
    renderGame(state.lastMatch);
  }

  async function confirmTarget() {
    if (!state.targetingMode || !state.targetingMode.selectedTarget) return;
    var cardId = state.targetingMode.cardId;
    var targetId = state.targetingMode.selectedTarget;
    var isSpellTarget = !!state.targetingMode.isSpell;
    var selectedModes = state.targetingMode.selectedModes || null;
    state.targetingMode = null;
    if (isSpellTarget) { showSpellCastAnimation(cardId); } else { showCardFlyAnimation(cardId); }
    var actionPayload = { type: 'PLAY_FROM_HAND', cardId: cardId, targetId: targetId };
    if (selectedModes) actionPayload.selectedModes = selectedModes;
    var res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: actionPayload });
    if (!res.ok) { toast('Play failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    await refreshMatch();
    setSelected(null);
  }

  function cancelTargeting() {
    state.targetingMode = null;
    renderGame(state.lastMatch);
  }

  function enterEquipTargetingMode(equipmentId, equipCost) {
    var match = state.lastMatch;
    if (!match) return;
    var mySeat = match.viewerSeat;
    var myBf = match?.game?.zones?.[mySeat]?.battlefield || [];
    var targets = [];
    for (var i = 0; i < myBf.length; i++) {
      if (clientCardType(myBf[i]) === 'creature') targets.push(myBf[i]);
    }
    if (!targets.length) { toast('No creatures to equip to.', { type: 'warn', ms: 2000 }); return; }
    state.targetingMode = { cardId: equipmentId, validTargets: targets, selectedTarget: null, isEquip: true, equipCost: equipCost };
    renderGame(match);
  }

  async function confirmEquip() {
    if (!state.targetingMode || !state.targetingMode.isEquip || !state.targetingMode.selectedTarget) return;
    var equipmentId = state.targetingMode.cardId;
    var targetId = state.targetingMode.selectedTarget;
    state.targetingMode = null;
    var res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'EQUIP', cardId: equipmentId, targetId: targetId } });
    if (!res.ok) { toast('Equip failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    toast((cardMeta(equipmentId)?.name || 'Equipment') + ' equipped!', { type: 'success', ms: 1500 });
    await refreshMatch();
    setSelected(null);
  }

  function openZoneBrowser(seat, zoneName) {
    var match = state.lastMatch;
    if (!match) return;
    var zones = match?.game?.zones?.[seat];
    if (!zones) return;
    var cards = zones[zoneName] || [];
    if (!Array.isArray(cards) || !cards.length) return;
    var p = (match.players || []).find(function(x) { return x.seat === seat; });
    var ownerName = p ? (p.isBot ? p.username : ('@' + p.username)) : ('Seat ' + seat);
    var zoneLabel = zoneName === 'graveyard' ? 'Graveyard' : 'Exile';
    // Remove existing overlay
    var existing = document.querySelector('.zoneBrowserOverlay');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.className = 'zoneBrowserOverlay';
    var content = document.createElement('div');
    content.className = 'zoneBrowserContent';
    var title = document.createElement('div');
    title.className = 'zoneBrowserTitle';
    title.textContent = ownerName + ' \u2014 ' + zoneLabel + ' (' + cards.length + ')';
    content.appendChild(title);
    var closeBtn = document.createElement('button');
    closeBtn.className = 'zoneBrowserClose';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Close zone browser');
    closeBtn.onclick = function() { overlay.remove(); };
    content.appendChild(closeBtn);
    var grid = document.createElement('div');
    grid.className = 'zoneBrowserGrid';
    for (var i = 0; i < cards.length; i++) {
      var cid = cards[i];
      var meta = cardMeta(cid);
      var img = document.createElement('img');
      img.className = 'cardImg';
      img.src = meta?.imageSmall || meta?.imageNormal || '';
      img.alt = meta?.name || cid;
      img.loading = 'lazy';
      (function(capturedId) { img.onclick = function() { overlay.remove(); openCardModal(capturedId, zoneName); }; })(cid);
      grid.appendChild(img);
    }
    content.appendChild(grid);
    overlay.appendChild(content);
    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
  }

  function getCombatEligibleAttackers(match) {
    var mySeat = match?.viewerSeat;
    if (!mySeat) return [];
    var bf = match?.game?.zones?.[mySeat]?.battlefield || [];
    var out = [];
    for (var i = 0; i < bf.length; i++) {
      var cid = bf[i];
      if (clientCardType(cid) !== 'creature') continue;
      if (clientHasKeyword(cid, 'Defender')) continue;
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
    const c = options.meta || cardMeta(id); const img = document.createElement('img');
    img.className = 'cardImg'; img.src = c?.imageSmall || c?.imageNormal || ''; img.alt = c?.name || id;
    var isTokenCard = c?.isToken || (typeof id === 'string' && id.indexOf('tok_') === 0);
    if (!img.src && isTokenCard) {
      var tokenName = (c?.name || 'Token').toLowerCase();
      if (tokenName.includes('treasure')) {
        img.src = TREASURE_TOKEN_URI;
        img.style.borderRadius = '6px';
        img.style.objectFit = 'cover';
      } else {
        var tokenEmoji = String.fromCodePoint(0x2B50);
        if (tokenName.includes('food')) tokenEmoji = String.fromCodePoint(0x1F356);
        else if (tokenName.includes('clue')) tokenEmoji = String.fromCodePoint(0x1F50D);
        else if (tokenName.includes('blood')) tokenEmoji = String.fromCodePoint(0x1FA78);
        else if (tokenName.includes('map')) tokenEmoji = String.fromCodePoint(0x1F5FA);
        var tLabel = c?.name || 'Token';
        img.style.background = 'rgba(20,20,30,0.85)';
        img.style.borderRadius = '10px';
        img.style.border = '1px solid rgba(245,158,11,0.3)';
        img.style.objectFit = 'none';
        img.alt = tLabel;
        img.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="90"><text x="50%" y="40%" dominant-baseline="central" text-anchor="middle" font-size="32">' + tokenEmoji + '</text><text x="50%" y="72%" dominant-baseline="central" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.6)" font-weight="700" font-family="system-ui">' + tLabel + '</text></svg>');
      }
    }
    img.width = options.w || 64; img.height = options.h || 90;
    img.decoding = 'async';
    if (options.lazy) img.loading = 'lazy';
    img.dataset.cardId = id;
    if (state.selected?.id === id && state.selected?.zone === options.zone && state.selected?.seat === options.seat) img.classList.add('selected');
    img.onclick = () => {
      if (state.selected?.id === id && state.selected?.zone === (options.zone || null) && state.selected?.seat === (options.seat || null)) {
        setSelected(null);
      } else {
        setSelected({ id, zone: options.zone || null, seat: options.seat || null });
      }
    };
    if (options.onDblClick) img.ondblclick = options.onDblClick;
    else img.ondblclick = () => openCardModal(id, options.zone || null);
    // Long-press on mobile opens card modal
    var lpTimer = null;
    img.addEventListener('touchstart', function(ev) {
      lpTimer = setTimeout(function() { lpTimer = null; openCardModal(id, options.zone || null); }, 500);
    }, { passive: true });
    img.addEventListener('touchend', function() { if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; } }, { passive: true });
    img.addEventListener('touchmove', function() { if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; } }, { passive: true });
    // Right-click context menu
    img.oncontextmenu = function(ev) { showCardContextMenu(ev, id, options.zone || null, options.seat || null); };
    // Wrap battlefield creatures with P/T badge + summoning sickness + tapped + attacking
    var typeLine = String(c?.typeLine || '').toLowerCase();
    if (options.zone === 'battlefield' && typeLine.includes('creature')) {
      var wrap = document.createElement('div');
      wrap.className = 'cardWrap';
      var cs = options.cardState;
      if (cs && cs.tapped) wrap.classList.add('tapped');
      if (cs && cs.summoningSick) {
        wrap.classList.add('summonSick');
        var ssIcon = document.createElement('div');
        ssIcon.className = 'summonSickIcon';
        ssIcon.style.cssText = 'top:50%;left:50%;transform:translate(-50%,-50%);right:auto;';
        ssIcon.textContent = '\u23F3';
        wrap.appendChild(ssIcon);
      }
      if (options.isAttacking) {
        var atkIcon = document.createElement('div');
        atkIcon.className = 'attackIcon';
        atkIcon.textContent = '\u2694';
        wrap.appendChild(atkIcon);
      }
      // Keyword icons
      var kwMap = { 'Haste':'\uD83D\uDD25','Vigilance':'\uD83D\uDC41','Defender':'\uD83D\uDEE1','Indestructible':'\uD83D\uDC8E','Hexproof':'\u2B21','Flying':'\uD83E\uDD85','Reach':'\uD83C\uDFF9','First Strike':'\u26A1','Double Strike':'\u26A1','Menace':'\uD83D\uDE08','Trample':'\uD83E\uDDB6','Deathtouch':'\u2620','Lifelink':'\uD83D\uDC9C' };
      var kwTL = []; var kwTR = []; var kwBL = [];
      var myKws = clientGetKeywords(id);
      var tempKwList = options.match?.game?.tempKeywords || [];
      for (var tki = 0; tki < tempKwList.length; tki++) {
        if (tempKwList[tki].cardId === id && myKws.indexOf(tempKwList[tki].keyword) < 0) {
          myKws = myKws.concat([tempKwList[tki].keyword]);
        }
      }
      for (var ki = 0; ki < myKws.length; ki++) {
        var kw = myKws[ki];
        if (!kwMap[kw]) continue;
        if (KW_TL.has(kw)) kwTL.push(kw);
        else if (KW_TR.has(kw)) kwTR.push(kw);
        else if (KW_BL.has(kw)) kwBL.push(kw);
      }
      var totalIcons = kwTL.length + kwTR.length + kwBL.length;
      if (totalIcons > 0) {
        var shown = 0; var maxIcons = 4;
        var addIcons = function(arr, cls) {
          if (!arr.length || shown >= maxIcons) return;
          var container = document.createElement('div');
          container.className = 'kwIcons ' + cls;
          for (var j = 0; j < arr.length && shown < maxIcons; j++) {
            var ic = document.createElement('div');
            ic.className = 'kwIcon';
            ic.textContent = kwMap[arr[j]];
            ic.title = arr[j];
            if (arr[j] === 'Double Strike') ic.style.fontSize = '7px';
            container.appendChild(ic);
            shown++;
          }
          wrap.appendChild(container);
        };
        addIcons(kwTL, 'kwIcons-tl');
        addIcons(kwTR, 'kwIcons-tr');
        addIcons(kwBL, 'kwIcons-bl');
      }
      // Aura badge + green P/T
      var auraBuffs = options.auraMap?.[id] || (options.match ? clientGetAuraBuffs(id, options.match) : { power: 0, toughness: 0, count: 0 });
      if (auraBuffs.count > 0) {
        var abadge = document.createElement('div');
        abadge.className = 'auraBadge';
        abadge.textContent = '\u2728' + auraBuffs.count;
        wrap.appendChild(abadge);
      }
      // Equipment badge + peek strip
      var equipBuffs = options.match ? clientGetEquipmentBuffs(id, options.match) : { power: 0, toughness: 0, count: 0 };
      if (equipBuffs.count > 0) {
        var eqbadge = document.createElement('div');
        eqbadge.className = 'equipBadge';
        eqbadge.textContent = '\u2694' + equipBuffs.count;
        wrap.appendChild(eqbadge);
        var eqIds = clientGetEquipmentOnCreature(id, options.match);
        for (var eqi = 0; eqi < eqIds.length && eqi < 2; eqi++) {
          var eqPeek = document.createElement('div');
          eqPeek.className = 'equipPeek';
          eqPeek.style.top = (-14 - eqi * 16) + 'px';
          var eqImg = document.createElement('img');
          eqImg.src = cardMeta(eqIds[eqi])?.imageSmall || cardMeta(eqIds[eqi])?.imageNormal || '';
          eqPeek.appendChild(eqImg);
          (function(eqCardId) {
            eqPeek.onclick = function() { openCardModal(eqCardId, 'battlefield'); };
          })(eqIds[eqi]);
          wrap.appendChild(eqPeek);
        }
      }
      if (c?.isToken) {
        var tokIcon = document.createElement('div');
        tokIcon.className = 'tokenIndicator';
        tokIcon.textContent = 'T';
        tokIcon.title = 'Token';
        wrap.appendChild(tokIcon);
      }
      wrap.appendChild(img);
      var badge = document.createElement('div');
      badge.className = 'ptBadge';
      var basePw = Number(c?.power) || 0;
      var baseTw = Number(c?.toughness) || 0;
      var preBuffs = options.buffMap?.[id];
      var tbPw = 0; var tbTw = 0;
      if (preBuffs) { tbPw = preBuffs.power; tbTw = preBuffs.toughness; }
      else {
        var tempBuffs = options.match?.game?.tempBuffs || [];
        for (var tbi = 0; tbi < tempBuffs.length; tbi++) {
          if (tempBuffs[tbi].cardId === id) { tbPw += tempBuffs[tbi].power; tbTw += tempBuffs[tbi].toughness; }
        }
      }
      var buffedPw = basePw + auraBuffs.power + equipBuffs.power + tbPw;
      var buffedTw = baseTw + auraBuffs.toughness + equipBuffs.toughness + tbTw;
      var isBuffed = auraBuffs.power !== 0 || auraBuffs.toughness !== 0 || equipBuffs.power !== 0 || equipBuffs.toughness !== 0 || tbPw !== 0 || tbTw !== 0;
      var dmg = cs ? (Number(cs.damage) || 0) : 0;
      if (dmg > 0) {
        var remaining = buffedTw - dmg;
        if (isBuffed) {
          badge.innerHTML = '<span class="ptBuffed">' + buffedPw + '</span>/<span class="ptDamaged">' + remaining + '</span>';
        } else {
          badge.innerHTML = escapeHtml(String(buffedPw)) + '/<span class="ptDamaged">' + remaining + '</span>';
        }
      } else if (isBuffed) {
        badge.innerHTML = '<span class="ptBuffed">' + buffedPw + '</span>/<span class="ptBuffed">' + buffedTw + '</span>';
      } else {
        badge.textContent = buffedPw + '/' + buffedTw;
      }
      wrap.appendChild(badge);
      // Forward click/dblclick to wrapper level too
      wrap.dataset.cardId = id;
      return wrap;
    }
    if (options.zone === 'battlefield') {
      // Wrap ALL battlefield permanents in .cardWrap so targeting mode can find them
      var bfWrap = document.createElement('div');
      bfWrap.className = 'cardWrap' + (c?.isToken ? ' tokenWrap' : '');
      bfWrap.dataset.cardId = id;
      var cs2 = options.cardState;
      if (cs2 && cs2.tapped) bfWrap.classList.add('tapped');
      bfWrap.appendChild(img);
      // "Equipped to [creature]" badge for attached equipment
      var eqTarget = options.match?.game?.equipmentAttachments?.[id];
      if (eqTarget) {
        var eqTargetMeta = cardMeta(eqTarget);
        var eqBadge2 = document.createElement('div');
        eqBadge2.className = 'equippedToBadge';
        eqBadge2.textContent = '\u2694 ' + (eqTargetMeta?.name || 'Equipped');
        bfWrap.appendChild(eqBadge2);
      }
      return bfWrap;
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
    var losers = match?.game?.losers || [];
    var isDead = losers.indexOf(seat) >= 0;
    var critThresh = match.format === 'commander' ? GC.LIFE_CRIT_CMD : GC.LIFE_CRIT_STD;
    var lifeCritical = life != null && life <= critThresh && life > 0;
    el.className = 'seatPanel' + (isActive ? ' active' : '') + (lifeCritical && !isViewer ? ' lowHealth' : '') + (isDead ? ' eliminated' : '');
    el.dataset.seat = seat;

    const bar = document.createElement('div');
    bar.className = 'seatBar';
    var lifeBadgeClass = 'lifeBadge' + (lifeCritical ? ' critical' : '');
    // Detect life change for flash
    if (!state.prevLifeBySeat) state.prevLifeBySeat = {};
    var prevLife = state.prevLifeBySeat[seat];
    var lifeFlash = prevLife != null && life != null && life < prevLife;
    state.prevLifeBySeat[seat] = life;
    bar.innerHTML = '<div class="seatName">' + escapeHtml(name) + '</div>'
      + '<div class="' + lifeBadgeClass + '"><span class="lifeIcon">\u2764</span> ' + (life == null ? '?' : String(life)) + '</div>';
    if (lifeFlash) {
      var badge = bar.querySelector('.lifeBadge');
      if (badge) {
        badge.classList.add('flash');
        setTimeout(function() { badge.classList.remove('flash'); }, 400);
      }
    }
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
      var isClickableZone = (label === 'GY' || label === 'Exile') && n > 0;
      b.className = 'zoneBadge' + (isClickableZone ? ' clickable' : '');
      b.textContent = label + ' ' + n;
      if (isClickableZone) {
        var zoneName = label === 'GY' ? 'graveyard' : 'exile';
        (function(capturedSeat, capturedZone) { b.onclick = function() { openZoneBrowser(capturedSeat, capturedZone); }; })(seat, zoneName);
      }
      zr.appendChild(b);
    }
    el.appendChild(zr);

    // Opponent hand card-backs display (non-viewer only)
    if (!isViewer) {
      var handCount = Array.isArray(hand) ? hand.length : Number(hand?.count || 0);
      var oppHandTray = document.createElement('div');
      oppHandTray.className = 'oppHandTray';
      oppHandTray.dataset.seat = seat;
      // Detect card played (hand count decreased) for exit animation
      var prevCount = state.prevHandCounts[seat];
      var cardPlayed = prevCount != null && handCount < prevCount;
      state.prevHandCounts[seat] = handCount;
      // Check game log for recent opponent actions to highlight a card
      var highlightIdx = -1;
      if (match?.log && match.log.length > 0) {
        var lastEvt = match.log[match.log.length - 1];
        if (lastEvt && lastEvt.seat === seat && (lastEvt.type === 'PLAY' || lastEvt.type === 'CAST_SPELL' || lastEvt.type === 'BOT_PLAY' || lastEvt.type === 'BOT_CAST_SPELL')) {
          highlightIdx = 0; // highlight first card to suggest activity
        }
      }
      if (handCount > 0) {
        for (var ohi = 0; ohi < handCount; ohi++) {
          var cardBack = document.createElement('img');
          cardBack.className = 'oppHandCard' + (ohi === highlightIdx ? ' highlight' : '');
          cardBack.src = CARD_BACK_URI;
          cardBack.alt = 'Card back';
          cardBack.width = 48; cardBack.height = 67;
          cardBack.draggable = false;
          oppHandTray.appendChild(cardBack);
        }
        // Animate an extra card exiting when a card was just played
        if (cardPlayed) {
          var ghost = document.createElement('img');
          ghost.className = 'oppHandCard exiting';
          ghost.src = CARD_BACK_URI;
          ghost.alt = '';
          ghost.width = 48; ghost.height = 67;
          ghost.draggable = false;
          oppHandTray.insertBefore(ghost, oppHandTray.firstChild);
          setTimeout(function() { if (ghost.parentNode) ghost.remove(); }, 400);
        }
      } else {
        oppHandTray.innerHTML = '<div style="color:rgba(255,255,255,0.3);font-size:11px;font-style:italic;padding:4px 0;">No cards in hand</div>';
      }
      el.appendChild(oppHandTray);
    }

    const bf = Array.isArray(zones?.battlefield) ? zones.battlefield : [];
    const bfArea = document.createElement('div');
    bfArea.className = 'bfArea';
    // Determine which cards are attacking (from combat state or pending)
    var combatAttackers = match?.game?.combat?.attackers || {};
    // Filter out attached auras — they render as badges on their target creature
    // Equipment stays visible on battlefield with an "Equipped to" badge
    var auraAttachments = match?.game?.auraAttachments || {};
    var equipAttachments = match?.game?.equipmentAttachments || {};
    var visibleBf = bf.filter(function(id) { return !auraAttachments[id]; });
    // Hide bot-played cards during progressive reveal animation
    if (state._hiddenBotCards) {
      visibleBf = visibleBf.filter(function(id) { return !state._hiddenBotCards[id]; });
    }
    // Pre-compute buff and aura maps for this seat's cards
    var buffMap = {}; var auraMap = {};
    var rawBuffs = match?.game?.tempBuffs || [];
    for (var rbi = 0; rbi < rawBuffs.length; rbi++) {
      var rb = rawBuffs[rbi]; if (!buffMap[rb.cardId]) buffMap[rb.cardId] = { power: 0, toughness: 0 };
      buffMap[rb.cardId].power += rb.power; buffMap[rb.cardId].toughness += rb.toughness;
    }
    for (var abi = 0; abi < visibleBf.length; abi++) {
      auraMap[visibleBf[abi]] = clientGetAuraBuffs(visibleBf[abi], match);
    }
    // Partition into main battlefield cards and non-creature tokens
    var mainBf = []; var tokenBf = [];
    for (var pi = 0; pi < visibleBf.length; pi++) {
      var pid = visibleBf[pi];
      var pMeta = cardMeta(pid);
      var pType = String(pMeta?.typeLine || '').toLowerCase();
      if (pMeta?.isToken && !pType.includes('creature')) {
        tokenBf.push(pid);
      } else {
        mainBf.push(pid);
      }
    }
    if (mainBf.length) {
      for (var bfi = 0; bfi < mainBf.length; bfi++) {
        var id = mainBf[bfi];
        var cs = match?.game?.cardState?.[id] || null;
        var isAtk = !!combatAttackers[id] || !!state.pendingAttackers[id];
        var cardEl = renderCardImg(id, { zone: 'battlefield', seat, w: 72, h: 100, lazy: !isViewer, cardState: cs, isAttacking: isAtk, match: match, meta: cardMeta(id), buffMap: buffMap, auraMap: auraMap });
        bfArea.appendChild(cardEl);
      }
    } else if (!tokenBf.length) {
      bfArea.innerHTML = '<div class="emptyZone">No permanents</div>';
    }
    // Apply targeting mode CSS classes + click handlers
    if (state.targetingMode && visibleBf.length) {
      var tgtCardEls = bfArea.querySelectorAll('.cardWrap');
      for (var tci = 0; tci < tgtCardEls.length; tci++) {
        var tWrap = tgtCardEls[tci];
        var tCid = tWrap.dataset.cardId;
        if (!tCid) continue;
        if (state.targetingMode.validTargets.indexOf(tCid) >= 0) {
          tWrap.classList.add('canTarget');
          if (state.targetingMode.selectedTarget === tCid) tWrap.classList.add('targetSelected');
          // Override click at wrapper level — prevent default setSelected/inspector from firing
          (function(capturedId) {
            tWrap.onclick = function(ev) { ev.stopPropagation(); handleTargetClick(capturedId); };
            // Also override the inner img click to prevent setSelected
            var innerImg = tWrap.querySelector('img');
            if (innerImg) innerImg.onclick = function(ev) { ev.stopPropagation(); handleTargetClick(capturedId); };
          })(tCid);
        } else {
          tWrap.classList.add('targetIneligible');
        }
      }
    }
    // Apply combat CSS classes after creating elements
    if (state.combatMode && visibleBf.length) {
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
          } else if (state._atkStagedCreatures.indexOf(cid) >= 0) {
            cWrap.classList.add('attacking');
            cWrap.classList.add('staged');
          } else if (eligibleAtk.indexOf(cid) >= 0) {
            cWrap.classList.add('canAttack');
          } else if (clientCardType(cid) === 'creature') {
            cWrap.classList.add('combatIneligible');
          }
        } else if (state.combatMode === 'selecting_blockers') {
          if (isViewer) {
            // Viewer's creatures
            var isBlocking = false;
            for (var bk in state.pendingBlockers) { var bArr = state.pendingBlockers[bk]; if (Array.isArray(bArr) ? bArr.indexOf(cid) >= 0 : bArr === cid) { isBlocking = true; break; } }
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
    // Wrap battlefield + tokens in a horizontal row
    var bfRowEl = document.createElement('div');
    bfRowEl.className = 'bfRow';
    bfRowEl.appendChild(bfArea);
    if (isDead) {
      bfArea.style.position = 'relative';
      var skullOv = document.createElement('div');
      skullOv.className = 'seatDeathOverlay';
      skullOv.textContent = '\u2620';
      bfArea.appendChild(skullOv);
    }

    // Token tray for non-creature tokens (Treasure, Food, Clue, etc.)
    if (tokenBf.length) {
      var tray = document.createElement('div');
      tray.className = 'tokenTray';
      // Group tokens by name for count badges
      var tokenGroups = {};
      for (var tgi = 0; tgi < tokenBf.length; tgi++) {
        var tgId = tokenBf[tgi];
        var tgName = cardMeta(tgId)?.name || 'Token';
        if (!tokenGroups[tgName]) tokenGroups[tgName] = [];
        tokenGroups[tgName].push(tgId);
      }
      for (var tgKey in tokenGroups) {
        var tgIds = tokenGroups[tgKey];
        var repId = tgIds[0];
        var tcWrap = document.createElement('div');
        tcWrap.className = 'tokenCardWrap';
        tcWrap.dataset.cardId = repId;
        var tcCard = renderCardImg(repId, { zone: 'battlefield', seat, w: 48, h: 67, lazy: !isViewer, cardState: match?.game?.cardState?.[repId] || null, match: match, meta: cardMeta(repId) });
        tcWrap.appendChild(tcCard);
        if (tgIds.length >= 2) {
          var tcCount = document.createElement('div');
          tcCount.className = 'tokenCount';
          tcCount.textContent = String(tgIds.length);
          tcWrap.appendChild(tcCount);
        }
        (function(capturedIds) {
          tcWrap.onclick = function() { showCardContextMenu({ preventDefault: function(){}, clientX: tcWrap.getBoundingClientRect().right, clientY: tcWrap.getBoundingClientRect().top }, capturedIds[0], 'battlefield', seat); };
        })(tgIds);
        tray.appendChild(tcWrap);
      }
      bfRowEl.appendChild(tray);
    }
    el.appendChild(bfRowEl);

    // Player seat targeting for spells (e.g., "target player" damage spells)
    if (state.targetingMode && !isViewer) {
      var seatTargetId = 'seat:' + seat;
      if (state.targetingMode.validTargets.indexOf(seatTargetId) >= 0) {
        el.style.cursor = 'pointer';
        el.style.outline = '2px solid rgba(239,68,68,0.6)';
        el.style.outlineOffset = '-2px';
        if (state.targetingMode.selectedTarget === seatTargetId) {
          el.style.outline = '3px solid rgba(239,68,68,1)';
          el.style.background = 'rgba(239,68,68,0.08)';
        }
        (function(capturedSeatTarget) { el.onclick = function(e) { e.stopPropagation(); handleTargetClick(capturedSeatTarget); }; })(seatTargetId);
      }
    }

    // Attack target selection highlighting (Commander multiplayer — batch select)
    if (state._atkStagedCreatures.length > 0 && !isViewer && !isDead) {
      el.classList.add('atkTargetable');
      (function(capturedSeat) { el.onclick = function(e) { e.stopPropagation(); selectAttackTarget(capturedSeat); }; })(seat);
    }

    return el;
  }

  function renderTurnBar(match) {
    const bar = $('#turnBar');
    if (match.game?.status === 'finished') {
      bar.innerHTML = '<div class="turnInfo">Game Over</div>';
      bar.dataset.cacheKey = 'finished';
      return;
    }
    const activeSeat = match.game?.activePlayerSeat;
    const activePlayer = (match.players || []).find(p => p.seat === activeSeat);
    const activeName = activeSeat === match.viewerSeat ? 'You' : (activePlayer ? (activePlayer.isBot ? activePlayer.username : ('@' + activePlayer.username)) : ('Seat ' + activeSeat));
    const step = match.game?.step || 'main1';
    const isMyTurn = activeSeat === match.viewerSeat;
    const isMyPriority = match.game?.prioritySeat === match.viewerSeat;
    const seats = (match.players || []).map(p => p.seat).sort((a, b) => a - b);
    const isMulti = seats.length > 2;
    const pendingAtkCount = Object.keys(state.pendingAttackers).length;
    var pendingBlkCount = 0;
    for (var pbk in state.pendingBlockers) { var pbArr = state.pendingBlockers[pbk]; pendingBlkCount += Array.isArray(pbArr) ? pbArr.length : 1; }

    const mana = match.game?.manaBySeat?.[match.viewerSeat] || { current: 0, max: 0 };
    const cacheKey = (match.game?.turn || '?') + ':' + activeSeat + ':' + step + ':' + seats.length + ':' + mana.current + '/' + mana.max + ':' + pendingAtkCount + ':' + pendingBlkCount + ':' + (state.combatMode || 'none') + ':q' + (state.quickMode ? '1' : '0');
    if (bar.dataset.cacheKey === cacheKey) return;
    bar.dataset.cacheKey = cacheKey;

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
        + '<button id="btnSkipCombat" class="btn">Skip Combat</button>'
        + '<button id="btnGameEndTurn" class="btn">End Turn</button>';
    } else if (step === 'combat_blockers' && isMyPriority) {
      buttonsHtml = '<button id="btnConfirmBlockers" class="btn btnPrimary">Confirm Blocks' + (pendingBlkCount ? ' (' + pendingBlkCount + ')' : '') + '</button>'
        + '<button id="btnNoBlocks" class="btn">No Blocks</button>'
        + '<button id="btnGameEndTurn" class="btn">End Turn</button>';
    } else if (step === 'main2' && isMyTurn) {
      buttonsHtml = '<button id="btnGameEndTurn" class="btn btnPrimary">End Turn</button>';
    } else if (step === 'discard' && match.game?.discardPending?.seat === mySeat) {
      buttonsHtml = '<div class="combatBanner" style="background:rgba(239,68,68,0.15);border-color:rgba(239,68,68,0.3);color:rgba(239,68,68,0.9);">Discard to hand size \u2014 select cards in the overlay above</div>';
    } else if (step === 'combat_blockers' && !isMyPriority) {
      var defenderPlayer = (match.players || []).find(function(p) { return p.seat === match.game?.prioritySeat; });
      var defName = defenderPlayer ? (defenderPlayer.isBot ? defenderPlayer.username : ('@' + defenderPlayer.username)) : 'Opponent';
      buttonsHtml = '<div class="combatBanner">\u2694 Waiting for ' + escapeHtml(defName) + ' to declare blockers\u2026</div>';
    } else {
      buttonsHtml = '<button id="btnGameEndTurn" class="btn btnPrimary" disabled>End Turn</button>';
    }

    var hasBot = (match.players || []).some(function(p) { return p.isBot; });
    var quickToggleHtml = hasBot ? '<label class="quickToggle"><input type="checkbox" id="chkQuickMode"' + (state.quickMode ? ' checked' : '') + '> Quick bot turns</label>' : '';

    bar.innerHTML = '<div class="turnInfo">Turn <span class="turnHighlight">' + (match.game?.turn || '?') + '</span></div>'
      + '<div class="turnInfo">' + (isMyTurn ? '<span class="turnHighlight">Your turn</span>' : escapeHtml(activeName) + "'s turn") + '</div>'
      + phaseHtml
      + turnOrderHtml
      + buttonsHtml
      + quickToggleHtml
      + '<button id="btnConcede" class="btn" style="color:rgba(239,68,68,0.7);border-color:rgba(239,68,68,0.2);background:transparent;margin-left:auto;">Concede</button>';

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
    var concedeBtn = bar.querySelector('#btnConcede');
    if (concedeBtn) concedeBtn.onclick = concede;
    var quickChk = bar.querySelector('#chkQuickMode');
    if (quickChk) quickChk.onchange = function() { state.quickMode = quickChk.checked; };
  }

  function buildSeatCacheKey(match, seat) {
    var z = match?.game?.zones?.[seat];
    var bf = z?.battlefield || [];
    var cs = match?.game?.cardState || {};
    var hand = z?.hand;
    var handCount = Array.isArray(hand) ? hand.length : Number(hand?.count || 0);
    var parts = [
      seat,
      match?.game?.lifeBySeat?.[seat],
      bf.join(','),
      match?.game?.activePlayerSeat,
      (match?.game?.combat?.attackers ? Object.keys(match.game.combat.attackers).join(',') : ''),
      'h' + handCount,
    ];
    for (var i = 0; i < bf.length; i++) {
      var s = cs[bf[i]];
      if (s) parts.push(bf[i] + ':' + (s.tapped ? 't' : '') + (s.summoningSick ? 's' : '') + (s.damage || 0));
    }
    var tb = match?.game?.tempBuffs;
    if (tb) for (var j = 0; j < tb.length; j++) { var b = tb[j]; parts.push('b' + b.cardId + b.power + b.toughness); }
    var tk = match?.game?.tempKeywords;
    if (tk) for (var k = 0; k < tk.length; k++) { parts.push('k' + tk[k].cardId + tk[k].keyword); }
    var aa = match?.game?.auraAttachments;
    if (aa) { for (var aid in aa) parts.push('a' + aid + aa[aid]); }
    parts.push(state.combatMode || 'n');
    parts.push(state.targetingMode ? state.targetingMode.cardId + (state.targetingMode.selectedTarget || '') : 'n');
    parts.push(state.selected?.id || 'n');
    var pa = state.pendingAttackers; for (var pk in pa) { if (pa[pk]) parts.push('pa' + pk); }
    var pb = state.pendingBlockers; for (var bk in pb) { if (pb[bk]) parts.push('pb' + bk + (Array.isArray(pb[bk]) ? pb[bk].join('.') : pb[bk])); }
    var lib = z?.library; var gy = z?.graveyard; var ex = z?.exile;
    parts.push('l' + (Array.isArray(lib) ? lib.length : (lib?.count || 0)));
    parts.push('g' + (Array.isArray(gy) ? gy.length : 0));
    parts.push('e' + (Array.isArray(ex) ? ex.length : 0));
    return parts.join('|');
  }

  function buildHandCacheKey(match, mySeat) {
    var z = match?.game?.zones?.[mySeat];
    var hand = z?.hand || [];
    var mana = match?.game?.manaBySeat?.[mySeat] || { current: 0, max: 0 };
    var step = match?.game?.step || 'main1';
    return hand.join(',') + ':' + mana.current + '/' + mana.max + ':' + step + ':' + (state.selected?.id || 'n') + ':' + (state.targetingMode ? 'tm' : 'n') + ':' + (match?.game?.activePlayerSeat || 0);
  }

  function renderGame(match) {
    const show = !!match && (match.phase === 'playing' || match.phase === 'finished' || match.phase === 'mulligan') && !!match.viewerSeat;
    $('#gamePanel').style.display = show ? '' : 'none';
    if (!show) return;

    // During mulligan, skip heavy board rendering — overlay covers everything
    if (match.phase === 'mulligan') {
      var existingMulliganOverlay = document.querySelector('#gameBoard .mulliganOverlay');
      if (!existingMulliganOverlay) {
        var mulliganOverlay = renderMulliganOverlay(match);
        document.getElementById('gameBoard').appendChild(mulliganOverlay);
      }
      updateMulliganOverlay(match);
      return;
    }

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
      state._atkStagedCreatures = [];
      state.pendingBlockers = {};
      state.selectedBlocker = null;
    }
    // Clear targeting mode if not in a main phase
    if (step !== 'main1' && step !== 'main2') { state.targetingMode = null; }

    const seats = (match.players || []).map(p => p.seat).sort((a, b) => a - b);
    const oppSeats = seats.filter(s => s !== mySeat);

    var oppCacheKey = oppSeats.map(function(s) { return buildSeatCacheKey(match, s); }).join('||') + '||atk:' + (state._atkStagedCreatures.length || 'n') + ':ba' + (state._botAnimCounter || 0);
    const oppEl = $('#oppSide');
    if (oppEl.dataset.cacheKey !== oppCacheKey) {
      oppEl.innerHTML = '';
      const isMulti = oppSeats.length >= 2;
      oppEl.classList.toggle('multi', isMulti);
      for (const seat of oppSeats) {
        oppEl.appendChild(renderBoardSeat(match, seat, false));
      }
      oppEl.dataset.cacheKey = oppCacheKey;
    }

    renderTurnBar(match);

    // Targeting banner
    var existingTB = document.querySelector('#gameBoard .targetBanner');
    if (existingTB) existingTB.remove();
    if (state.targetingMode) {
      var tName = cardMeta(state.targetingMode.cardId)?.name || 'Aura';
      var tbDiv = document.createElement('div');
      tbDiv.className = 'targetBanner';
      tbDiv.innerHTML = '\uD83C\uDFAF Choose a target for <strong>' + escapeHtml(tName) + '</strong>'
        + '<button id="btnTargetConfirm" class="btn btnPrimary" style="margin-left:8px;padding:4px 12px;font-size:12px;"' + (state.targetingMode.selectedTarget ? '' : ' disabled') + '>Confirm</button>'
        + '<button id="btnTargetCancel" class="btn" style="padding:4px 12px;font-size:12px;">Cancel</button>';
      var turnBarEl = document.getElementById('turnBar');
      if (turnBarEl && turnBarEl.parentNode) turnBarEl.parentNode.insertBefore(tbDiv, turnBarEl.nextSibling);
      setTimeout(function() {
        var cb = document.getElementById('btnTargetConfirm');
        var cc = document.getElementById('btnTargetCancel');
        if (cb) cb.onclick = function() { if (state.targetingMode?.isEquip) confirmEquip(); else confirmTarget(); };
        if (cc) cc.onclick = function() { cancelTargeting(); };
      }, 0);
    }

    // Attack target selection banner (Commander multiplayer — batch select)
    var existingATB = document.querySelector('#gameBoard .atkTargetBanner');
    if (existingATB) existingATB.remove();
    if (state._atkStagedCreatures.length > 0) {
      var stagedN = state._atkStagedCreatures.length;
      var atbDiv = document.createElement('div');
      atbDiv.className = 'atkTargetBanner';
      atbDiv.innerHTML = '\u2694\uFE0F Click an opponent to assign <strong>' + stagedN + ' creature' + (stagedN > 1 ? 's' : '') + '</strong> to attack'
        + '<button id="btnAtkTargetCancel" class="btn" style="margin-left:8px;padding:4px 12px;font-size:12px;">Cancel</button>';
      var turnBarEl2 = document.getElementById('turnBar');
      if (turnBarEl2 && turnBarEl2.parentNode) turnBarEl2.parentNode.insertBefore(atbDiv, turnBarEl2.nextSibling);
      setTimeout(function() {
        var cancelBtn = document.getElementById('btnAtkTargetCancel');
        if (cancelBtn) cancelBtn.onclick = function() { cancelAttackTarget(); };
      }, 0);
    }

    // Response window banner (instant-speed casting)
    var existingRWB = document.querySelector('#gameBoard .responseBanner');
    if (existingRWB) existingRWB.remove();
    var rw = match?.game?.responseWindow;
    if (rw && rw.seat === mySeat) {
      var rwDiv = document.createElement('div');
      rwDiv.className = 'responseBanner';
      rwDiv.innerHTML = '\u26A1 Respond with an instant or '
        + '<button id="btnPassResponse" class="btn" style="margin-left:8px;padding:4px 14px;font-size:12px;background:rgba(168,85,247,0.7);color:#fff;border:none;border-radius:6px;font-weight:700;cursor:pointer;">Pass</button>';
      var turnBarEl3 = document.getElementById('turnBar');
      if (turnBarEl3 && turnBarEl3.parentNode) turnBarEl3.parentNode.insertBefore(rwDiv, turnBarEl3.nextSibling);
      setTimeout(function() {
        var passBtn = document.getElementById('btnPassResponse');
        if (passBtn) passBtn.onclick = async function() {
          var res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'PASS_RESPONSE' } });
          if (!res.ok) { toast('Pass failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
          await refreshMatch();
        };
      }, 0);
    }

    var mySeatCacheKey = buildSeatCacheKey(match, mySeat) + '||' + buildHandCacheKey(match, mySeat);
    const myEl = $('#mySide');
    if (myEl.dataset.cacheKey !== mySeatCacheKey) {
      myEl.innerHTML = '';
      myEl.appendChild(renderBoardSeat(match, mySeat, true));

      const zones = match?.game?.zones?.[mySeat];
      const hand = Array.isArray(zones?.hand) ? zones.hand : [];
      const handTray = document.createElement('div');
      handTray.className = 'handTray';

      // Mana display inside hand tray
      var handMana = match.game?.manaBySeat?.[mySeat] || { current: 0, max: 0 };
      var handManaEl = document.createElement('div');
      handManaEl.className = 'handMana';
      var hmInner = '<span class="hmLabel">Mana</span>';
      for (var hmi = 0; hmi < handMana.max; hmi++) {
        hmInner += '<div class="hmGem ' + (hmi < handMana.current ? 'full' : 'empty') + '"></div>';
      }
      hmInner += '<span class="hmText">' + handMana.current + '/' + handMana.max + '</span>';
      handManaEl.innerHTML = hmInner;
      if (!state.gameEntranceAnimated) {
        handManaEl.classList.add('manaEnter');
        state.gameEntranceAnimated = true;
      }
      handTray.appendChild(handManaEl);
      if (!hand.length) {
        handTray.insertAdjacentHTML('beforeend', '<div class="emptyZone">No cards in hand</div>');
      } else {
        for (const id of hand) {
          const img = renderCardImg(id, {
            zone: 'hand', seat: mySeat, w: 90, h: 126,
            onDblClick: async () => {
              if (!clientCanPlay(id, match)) { setSelected({ id, zone: 'hand', seat: mySeat }); return; }
              setSelected({ id, zone: 'hand', seat: mySeat }); await playSelectedToBattlefield();
            }
          });
          if (!clientCanPlay(id, match)) img.classList.add('unplayable');
          else if (rw && rw.seat === mySeat && clientCardType(id) === 'instant') img.classList.add('instantGlow');
          handTray.appendChild(img);
        }
      }
      myEl.appendChild(handTray);
      myEl.dataset.cacheKey = mySeatCacheKey;
    }

    // Combat click delegation (single listener, replaces per-card handlers)
    var gameBoard = document.getElementById('gameBoard');
    if (gameBoard && !gameBoard._combatDelegated) {
      gameBoard._combatDelegated = true;
      gameBoard.addEventListener('click', function(e) {
        if (!state.combatMode) return;
        var wrap = e.target.closest('.cardWrap[data-card-id]');
        if (!wrap) return;
        var cardId = wrap.dataset.cardId;
        if (!cardId) return;
        e.stopPropagation();
        var m = state.lastMatch;
        if (!m) return;
        var cardSeat = null;
        var allS = (m.players || []).map(function(p) { return p.seat; });
        for (var si = 0; si < allS.length; si++) {
          var sBf = m?.game?.zones?.[allS[si]]?.battlefield || [];
          if (sBf.indexOf(cardId) >= 0) { cardSeat = allS[si]; break; }
        }
        setSelected({ id: cardId, zone: 'battlefield', seat: cardSeat });
        if (state.combatMode === 'selecting_attackers' && cardSeat === m.viewerSeat) {
          toggleAttacker(cardId);
          setSelected(null);
        } else if (state.combatMode === 'selecting_blockers') {
          handleBlockerClick(cardId, cardSeat === m.viewerSeat);
          setSelected(null);
        }
      });
    }

    if (state.selected?.id) {
      if (!collectVisibleCardIds(match).includes(state.selected.id)) setSelected(null);
      else setSelected(state.selected);
    } else { setSelected(null); }

    // Clean up mulligan overlay if we transitioned out of mulligan
    var existingMulliganOverlay = document.querySelector('#gameBoard .mulliganOverlay');
    if (existingMulliganOverlay) existingMulliganOverlay.remove();

    // Game over overlay
    var existingOverlay = document.querySelector('#gameBoard .gameOverOverlay');
    if (match.game?.status === 'finished') {
      if (!existingOverlay) {
        var overlay = document.createElement('div');
        var isVictory = match.game.winner === match.viewerSeat;
        overlay.className = 'gameOverOverlay' + (isVictory ? ' victoryPulse' : '');
        var titleEl = document.createElement('div');
        titleEl.className = 'gameOverTitle ' + (isVictory ? 'victory' : 'defeat');
        titleEl.textContent = isVictory ? 'VICTORY' : 'DEFEAT';
        overlay.appendChild(titleEl);

        var reasonMap = { life: 'Life reached 0', commander_damage: 'Commander damage (21+)', deck_out: 'Library depleted', concede: 'Conceded' };
        var oppSeatsGO = (match.players || []).filter(function(p) { return p.seat !== match.viewerSeat; }).map(function(p) { return p.seat; });
        var reasonKey = isVictory ? (match.game.loserReasons || {})[oppSeatsGO[0]] : (match.game.loserReasons || {})[match.viewerSeat];
        if (reasonKey) {
          var reasonEl = document.createElement('div');
          reasonEl.className = 'gameOverReason';
          reasonEl.textContent = isVictory ? 'Opponent: ' + (reasonMap[reasonKey] || reasonKey) : reasonMap[reasonKey] || reasonKey;
          overlay.appendChild(reasonEl);
        }

        var myStats = match.game.stats?.[match.viewerSeat] || { damageDealt: 0, creaturesKilled: 0 };
        var myLife = match.game.lifeBySeat?.[match.viewerSeat] || 0;
        var turns = match.game.turn || 0;
        var statsRow = document.createElement('div');
        statsRow.className = 'gameOverStats';
        var statItems = [
          [String(turns), 'Turns'],
          [String(myLife), 'Life'],
          [String(myStats.creaturesKilled || 0), 'Kills'],
          [String(myStats.damageDealt || 0), 'Damage'],
          [String(myStats.spellsCast || 0), 'Spells'],
          [String(myStats.manaSpent || 0), 'Mana']
        ];
        if (match.format === 'commander' && match.game.commanderDamage) {
          var myCdMap = match.game.commanderDamage[match.viewerSeat] || {};
          var totalCd = 0; for (var cdKey in myCdMap) { totalCd += myCdMap[cdKey]; }
          statItems.push([String(totalCd), 'Cmdr Dmg']);
        }
        for (var sti = 0; sti < statItems.length; sti++) {
          var sd = document.createElement('div');
          sd.className = 'gameOverStat';
          sd.innerHTML = '<div class="gameOverStatVal">' + statItems[sti][0] + '</div><div class="gameOverStatLabel">' + statItems[sti][1] + '</div>';
          statsRow.appendChild(sd);
        }
        overlay.appendChild(statsRow);

        var oppSeatsForStats = (match.players || []).filter(function(p) { return p.seat !== match.viewerSeat; });
        if (oppSeatsForStats.length) {
          var oppLabel = document.createElement('div');
          oppLabel.className = 'gameOverSection';
          oppLabel.textContent = oppSeatsForStats[0].username || 'Opponent';
          overlay.appendChild(oppLabel);
          var oppStats = match.game.stats?.[oppSeatsForStats[0].seat] || {};
          var oppLife = match.game.lifeBySeat?.[oppSeatsForStats[0].seat] || 0;
          var oppItems = [[String(oppLife), 'Life'], [String(oppStats.creaturesKilled || 0), 'Kills'], [String(oppStats.damageDealt || 0), 'Damage']];
          var oppRow = document.createElement('div');
          oppRow.className = 'gameOverStats';
          for (var oi = 0; oi < oppItems.length; oi++) {
            var od = document.createElement('div'); od.className = 'gameOverStat';
            od.innerHTML = '<div class="gameOverStatVal">' + oppItems[oi][0] + '</div><div class="gameOverStatLabel">' + oppItems[oi][1] + '</div>';
            oppRow.appendChild(od);
          }
          overlay.appendChild(oppRow);
        }

        var btns = document.createElement('div');
        btns.className = 'gameOverBtns';
        var btnAgain = document.createElement('button');
        btnAgain.className = 'btn btnPrimary';
        btnAgain.textContent = 'Play Again';
        btnAgain.onclick = playAgain;
        var btnMenu = document.createElement('button');
        btnMenu.className = 'btn';
        btnMenu.textContent = 'Main Menu';
        btnMenu.onclick = function() { exitMatchMode(); };
        var btnDecks = document.createElement('button');
        btnDecks.className = 'btn';
        btnDecks.textContent = 'Change Decks';
        btnDecks.onclick = function() { exitMatchMode(); switchTab('decks'); };
        btns.appendChild(btnAgain);
        btns.appendChild(btnDecks);
        btns.appendChild(btnMenu);
        overlay.appendChild(btns);

        var board = document.getElementById('gameBoard');
        if (board) board.appendChild(overlay);
      }
    } else if (existingOverlay) {
      existingOverlay.remove();
    }

    // Scry overlay: show if scryPending is set for viewer
    if (match.game?.scryPending && match.game.scryPending.seat === mySeat) {
      showScryOverlay(match);
    }

    // Discard overlay: show if discardPending is set for viewer, remove if not
    if (match.game?.discardPending && match.game.discardPending.seat === mySeat) {
      showDiscardOverlay(match);
    } else {
      var existingDiscard = document.querySelector('.discardOverlay');
      if (existingDiscard) existingDiscard.remove();
    }

    renderCombatLines();
    renderEventLog(match);
  }

  function renderCombatLines() {
    var existing = document.querySelector('#gameBoard .combatSvg');
    if (existing) existing.remove();
    if (state.combatMode !== 'selecting_blockers') return;
    var pbs = state.pendingBlockers;
    var anyBlocks = false;
    for (var k in pbs) { if (pbs[k] && pbs[k].length) { anyBlocks = true; break; } }
    if (!anyBlocks) return;
    var board = document.getElementById('gameBoard');
    if (!board) return;
    var br = board.getBoundingClientRect();
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'combatSvg');
    svg.setAttribute('width', br.width);
    svg.setAttribute('height', br.height);
    var cardElMap = {};
    var allWraps = board.querySelectorAll('.cardWrap[data-card-id]');
    for (var wi = 0; wi < allWraps.length; wi++) { var wid = allWraps[wi].dataset.cardId; if (wid) cardElMap[wid] = allWraps[wi]; }
    for (var atkId in pbs) {
      var blockers = pbs[atkId];
      if (!blockers || !blockers.length) continue;
      var atkEl = cardElMap[atkId];
      if (!atkEl) continue;
      var atkRect = getGameBoardRelativeRect(atkEl);
      var ax = atkRect.left + atkRect.width / 2;
      var ay = atkRect.top + atkRect.height / 2;
      for (var bi = 0; bi < blockers.length; bi++) {
        var blkEl = cardElMap[blockers[bi]];
        if (!blkEl) continue;
        var blkRect = getGameBoardRelativeRect(blkEl);
        var bx = blkRect.left + blkRect.width / 2;
        var by = blkRect.top + blkRect.height / 2;
        var line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', bx); line.setAttribute('y1', by);
        line.setAttribute('x2', ax); line.setAttribute('y2', ay);
        line.setAttribute('class', 'combatLine');
        svg.appendChild(line);
        var dot1 = document.createElementNS(svgNS, 'circle');
        dot1.setAttribute('cx', bx); dot1.setAttribute('cy', by); dot1.setAttribute('r', 4);
        dot1.setAttribute('class', 'combatLineDot');
        svg.appendChild(dot1);
        var dot2 = document.createElementNS(svgNS, 'circle');
        dot2.setAttribute('cx', ax); dot2.setAttribute('cy', ay); dot2.setAttribute('r', 4);
        dot2.setAttribute('class', 'combatLineDot');
        svg.appendChild(dot2);
      }
    }
    board.appendChild(svg);
  }

  function renderEventLog(match) {
    var existing = document.querySelector('#gameBoard .eventLog');
    if (existing) existing.remove();
    if (!match?.log || !match.game || match.phase === 'lobby') return;
    var board = document.getElementById('gameBoard');
    if (!board) return;
    var logDiv = document.createElement('div');
    logDiv.className = 'eventLog' + (state.eventLogCollapsed ? ' collapsed' : '');
    var title = document.createElement('div');
    title.className = 'eventLogTitle';
    title.textContent = 'Game Log';
    logDiv.appendChild(title);
    var toggle = document.createElement('button');
    toggle.className = 'eventLogToggle';
    toggle.textContent = state.eventLogCollapsed ? '+' : '-';
    toggle.onclick = function(ev) { ev.stopPropagation(); state.eventLogCollapsed = !state.eventLogCollapsed; renderEventLog(match); };
    logDiv.appendChild(toggle);
    if (state.eventLogCollapsed) { logDiv.onclick = function() { state.eventLogCollapsed = false; renderEventLog(match); }; }
    var playerName = function(seat) {
      var p = (match.players || []).find(function(pl) { return pl.seat === seat; });
      return p ? p.username : 'Player ' + seat;
    };
    var cName = function(cid) { return cardMeta(cid)?.name || cid; };
    var displayTypes = {
      PLAY: function(e) { return playerName(e.seat) + ' played ' + cName(e.cardId); },
      CAST_SPELL: function(e) { return playerName(e.seat) + ' cast ' + cName(e.cardId); },
      BOT_PLAY: function(e) { return playerName(e.seat) + ' played ' + cName(e.cardId); },
      BOT_CAST_SPELL: function(e) { return playerName(e.seat) + ' cast ' + cName(e.cardId); },
      BOT_PASS: function(e) { return playerName(e.seat) + ' passed'; },
      DISCARD: function(e) { return playerName(e.seat) + ' discarded ' + (e.count || 1) + ' card(s) to hand size'; },
      BOT_DISCARD: function(e) { return playerName(e.seat) + ' discarded ' + (e.count || 1) + ' card(s) to hand size'; },
      TURN_START: function(e) { return 'Turn ' + (e.turn || '?') + ' - ' + playerName(e.seat); },
      DRAW: function(e) { return (e.by || 'Player') + ' drew ' + (e.n || 1) + ' card(s)'; },
      SPELL_DRAW: function(e) { return playerName(e.seat) + ' drew ' + (e.amount || 1) + ' card(s)'; },
      BLOCKERS_DECLARED: function(e) { return playerName(e.seat) + ' blocks with ' + (e.count || 0) + ' creature(s)'; },
      COMBAT_SKIPPED: function(e) { return playerName(e.seat) + ' skipped combat'; },
      ATTACKERS_DECLARED: function(e) { return playerName(e.seat) + ' attacks with ' + (e.count || '?') + ' creature(s)'; },
      COMBAT_RESOLVED: function() { return 'Combat resolved'; },
      CREATURE_DIED: function(e) { return cName(e.cardId) + ' died'; },
      SPELL_DAMAGE: function(e) { return playerName(e.seat) + ' took ' + e.damage + ' spell damage'; },
      SPELL_DAMAGE_CREATURE: function(e) { return cName(e.target) + ' took ' + e.damage + ' damage'; },
      SPELL_DESTROY: function(e) { return cName(e.target) + ' destroyed'; },
      SPELL_EXILE: function(e) { return cName(e.target) + ' exiled'; },
      SPELL_BOUNCE: function(e) { return cName(e.target) + ' bounced to hand'; },
      SPELL_BUFF: function(e) { return cName(e.target) + ' got ' + (e.power >= 0 ? '+' : '') + e.power + '/' + (e.toughness >= 0 ? '+' : '') + e.toughness; },
      SPELL_KEYWORD: function(e) { return cName(e.target) + ' gained ' + e.keyword; },
      SPELL_GAIN_LIFE: function(e) { return playerName(e.seat) + ' gained ' + e.amount + ' life'; },
      PLAYER_DAMAGE: function(e) { return playerName(e.seat) + ' took ' + e.damage + ' combat damage'; },
      CREATE_TOKEN: function(e) { return playerName(e.seat) + ' created ' + (e.name || 'a token'); },
      ACTIVATE: function(e) { return cName(e.cardId) + ' ability activated'; },
      LIFELINK: function(e) { return playerName(e.seat) + ' gained ' + e.amount + ' life (lifelink)'; },
      PLAYER_ELIMINATED: function(e) { return (e.by || 'Player') + ' eliminated'; },
      DECK_OUT: function(e) { return playerName(e.seat) + ' ran out of cards'; },
      CONCEDE: function(e) { return (e.by || 'Player') + ' conceded'; },
      GAME_OVER: function(e) { return 'Game over' + (e.winnerName ? ' - ' + e.winnerName + ' wins!' : ''); },
    };
    var entries = [];
    for (var li = match.log.length - 1; li >= 0 && entries.length < 25; li--) {
      var le = match.log[li];
      var fn = displayTypes[le.type];
      if (fn) entries.push(fn(le));
    }
    for (var ei = 0; ei < entries.length; ei++) {
      var entry = document.createElement('div');
      entry.className = 'eventEntry';
      entry.textContent = entries[ei];
      logDiv.appendChild(entry);
    }
    if (!entries.length) {
      var empty = document.createElement('div');
      empty.className = 'eventEntry';
      empty.textContent = 'No events yet.';
      logDiv.appendChild(empty);
    }
    board.appendChild(logDiv);
  }

  async function refreshMatch() {
    if (!state.activeMatchId) { $('#matchDebug').textContent = 'No active match.'; renderLobby(null); $('#gamePanel').style.display = 'none'; return; }
    try {
      var reconnBanner = document.querySelector('.reconnectBanner');
      const match = await supExec('api_getMatch', { matchId: state.activeMatchId });
      // Clear reconnection banner on success
      if (reconnBanner) reconnBanner.remove();
      state._reconnectAttempts = 0;
      state.lastMatch = match; await hydrateCardIndexForMatch(match);
      if (!state.lastLogIndex && match?.log?.length && match.phase === 'playing') {
        state.lastLogIndex = match.log.length;
      }
      processAnimationEvents(match);
      $('#matchDebug').textContent = JSON.stringify(match, null, 2);
      renderLobby(match); renderGame(match);
      if (document.querySelector('.appRoot').classList.contains('matchActive')) updateMatchBar();
    } catch (err) {
      // Show reconnection banner and retry
      if (!state._reconnectAttempts) state._reconnectAttempts = 0;
      state._reconnectAttempts++;
      var board = document.getElementById('gameBoard');
      if (board && !document.querySelector('.reconnectBanner')) {
        var banner = document.createElement('div');
        banner.className = 'reconnectBanner';
        banner.innerHTML = '<span class="spinner"></span> Reconnecting\\u2026';
        board.appendChild(banner);
      }
      var delay = Math.min(5000, 1000 * Math.pow(1.5, state._reconnectAttempts - 1));
      setTimeout(function() { refreshMatch(); }, delay);
    }
  }

  async function drawDebug() {
    if (!state.activeMatchId) return;
    $('#matchActionResult').textContent = 'Sending action\u2026';
    const res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'DRAW', n: 1 } });
    if (!res.ok) { $('#matchActionResult').textContent = 'Action failed: ' + res.error; toast('Action failed: ' + res.error, { type: 'error' }); return; }
    $('#matchActionResult').textContent = 'OK'; await refreshMatch();
  }

  async function concede() {
    if (!state.activeMatchId) return;
    if (!confirm('Concede this game?')) return;
    var res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'CONCEDE' } });
    if (!res.ok) { toast('Concede failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    toast('You conceded.', { type: 'info', ms: 3000 });
    await refreshMatch();
  }

  async function endTurn() {
    if (!state.activeMatchId) return;
    // Clear combat UI state
    state.combatMode = null;
    state.pendingAttackers = {};
    state._atkStagedCreatures = [];
    state.pendingBlockers = {};
    state.selectedBlocker = null;
    const hasBot = (state.lastMatch?.players || []).some(p => p.isBot);
    const res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'END_TURN' } });
    if (!res.ok) { toast('End turn failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    // Check if discard is required before turn advances
    await refreshMatch();
    if (state.lastMatch?.game?.discardPending) {
      // Discard overlay will be shown by renderGame
      return;
    }
    if (hasBot) {
      var botPlayers = (state.lastMatch?.players || []).filter(function(p) { return p.isBot; });

      // Shared helper: collect recent bot events grouped by seat
      state._suppressTurnOverlay = true;
      await refreshMatch();
      var log = state.lastMatch?.log || [];
      var botNameBySeat = {};
      for (var bni = 0; bni < botPlayers.length; bni++) {
        botNameBySeat[botPlayers[bni].seat] = botPlayers[bni].username || 'Bot';
      }
      // Derive turn order from log (preserves actual execution order)
      var seenSeats = {};
      var botTurnOrder = [];
      var eventsBySeat = {};
      for (var lei = 0; lei < log.length; lei++) {
        var le = log[lei];
        if (le.t < Date.now() - 10000) continue;
        var isBotEvt = (le.type === 'BOT_PLAY' || le.type === 'BOT_CAST_SPELL' ||
          (le.type === 'ATTACKERS_DECLARED' && le.by === 'bot' && le.count > 0) ||
          le.type === 'BOT_PASS');
        if (!isBotEvt) continue;
        if (!seenSeats[le.seat]) { seenSeats[le.seat] = true; botTurnOrder.push(le.seat); }
        if (!eventsBySeat[le.seat]) eventsBySeat[le.seat] = [];
        if (le.type === 'BOT_PLAY' || le.type === 'BOT_CAST_SPELL') {
          eventsBySeat[le.seat].push({ kind: 'play', entry: le });
        } else if (le.type === 'ATTACKERS_DECLARED') {
          eventsBySeat[le.seat].push({ kind: 'attack', entry: le });
        } else {
          eventsBySeat[le.seat].push({ kind: 'pass', entry: le });
        }
      }

      // Collect ALL bot-played card IDs and hide them from the board
      state._hiddenBotCards = {};
      state._botAnimCounter = 0;
      for (var hbi = 0; hbi < botTurnOrder.length; hbi++) {
        var hbEvents = eventsBySeat[botTurnOrder[hbi]] || [];
        for (var hei = 0; hei < hbEvents.length; hei++) {
          if (hbEvents[hei].kind === 'play' && hbEvents[hei].entry.cardId) {
            state._hiddenBotCards[hbEvents[hei].entry.cardId] = true;
          }
        }
      }
      // Force re-render with hidden cards — board now shows pre-bot state
      var oppEl = $('#oppSide');
      if (oppEl) oppEl.dataset.cacheKey = '';
      renderGame(state.lastMatch);

      if (state.quickMode) {
        // Quick mode — per-bot summaries with progressive reveal
        for (var bti = 0; bti < botTurnOrder.length; bti++) {
          var botSeat = botTurnOrder[bti];
          var botName = botNameBySeat[botSeat] || 'Bot';
          var seatEvents = eventsBySeat[botSeat] || [];
          var bar = $('#turnBar');
          if (bar) bar.innerHTML = '<div class="botThinking"><span class="spinner"></span> ' + botName + ' is thinking\u2026</div>';
          await new Promise(function(r) { setTimeout(r, 400); });
          // Reveal all cards this bot played at once
          for (var qi = 0; qi < seatEvents.length; qi++) {
            if (seatEvents[qi].kind === 'play' && seatEvents[qi].entry.cardId) {
              delete state._hiddenBotCards[seatEvents[qi].entry.cardId];
            }
          }
          state._botAnimCounter++;
          renderGame(state.lastMatch);
          var playCount = 0; var atkCount = 0; var passCount = 0;
          for (var si = 0; si < seatEvents.length; si++) {
            if (seatEvents[si].kind === 'play') playCount++;
            else if (seatEvents[si].kind === 'attack') atkCount++;
            else if (seatEvents[si].kind === 'pass') passCount++;
          }
          var parts = [];
          if (playCount) parts.push(playCount + ' card' + (playCount > 1 ? 's' : '') + ' played');
          if (atkCount) parts.push('attacked');
          if (passCount && !playCount) parts.push('passed');
          if (parts.length) toast(botName + ': ' + parts.join(', '), { type: 'info', ms: 2500 });
        }
        state._hiddenBotCards = {};
        state._botAnimCounter = 0;
        state._suppressTurnOverlay = false;
        await refreshMatch();
        if (state.lastMatch?.game?.status !== 'finished' && state.lastMatch?.game?.step !== 'combat_blockers') {
          showTurnOverlay('', true);
        }
      } else {
        // Full animation mode — show each bot's turn with progressive card reveal
        for (var bti = 0; bti < botTurnOrder.length; bti++) {
          var botSeat = botTurnOrder[bti];
          var botName = botNameBySeat[botSeat] || 'Bot';
          var seatEvents = eventsBySeat[botSeat] || [];
          if (state.lastMatch?.game?.status === 'finished') break;

          // Show "Bot N's Turn" overlay
          showTurnOverlay(botName, false);

          // Show "Bot N is thinking..." in turn bar
          var bar = $('#turnBar');
          if (bar) bar.innerHTML = '<div class="botThinking"><span class="spinner"></span> ' + botName + ' is thinking\u2026</div>';

          // Wait for overlay hold + thinking time
          await new Promise(function(r) { setTimeout(r, 1800); });

          // Reveal this bot's cards one at a time with overlays
          for (var sei = 0; sei < seatEvents.length; sei++) {
            var se = seatEvents[sei];
            if (se.kind === 'play' && se.entry.cardId) {
              // Reveal card on battlefield
              delete state._hiddenBotCards[se.entry.cardId];
              state._botAnimCounter++;
              renderGame(state.lastMatch);
              // Show card reveal overlay
              var isSpell = se.entry.type === 'BOT_CAST_SPELL';
              showBotPlayReveal(se.entry.cardId, botName, isSpell);
              await new Promise(function(r) { setTimeout(r, 1600); });
            } else if (se.kind === 'attack') {
              var tgtName = '';
              if (se.entry.targetSeat) {
                var tgtP = (state.lastMatch?.players || []).find(function(p) { return p.seat === se.entry.targetSeat; });
                tgtName = tgtP ? (tgtP.isBot ? tgtP.username : ('@' + tgtP.username)) : '';
              }
              showBotAttackOverlay(botName, se.entry.count, tgtName);
              await new Promise(function(r) { setTimeout(r, 1400); });
            } else if (se.kind === 'pass') {
              toast(botName + ' passed.', { type: 'info', ms: 2000 });
              await new Promise(function(r) { setTimeout(r, 1200); });
            }
          }
        }

        // Show "YOUR TURN" — unless game ended or it's blocker phase
        state._hiddenBotCards = {};
        state._botAnimCounter = 0;
        state._suppressTurnOverlay = false;
        await refreshMatch();
        if (state.lastMatch?.game?.status !== 'finished' && state.lastMatch?.game?.step !== 'combat_blockers') {
          showTurnOverlay('', true);
        }
      }
    } else {
      await refreshMatch();
    }
  }

  async function goToCombat() {
    if (!state.activeMatchId) return;
    var res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'GO_TO_COMBAT' } });
    if (!res.ok) { toast('Go to combat failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    state.combatMode = 'selecting_attackers';
    state.pendingAttackers = {};
    state._atkStagedCreatures = [];
    await refreshMatch();
  }

  async function confirmAttackers() {
    if (!state.activeMatchId) return;
    var attackerCount = Object.keys(state.pendingAttackers).length;
    if (!attackerCount) {
      toast('No attackers selected — tap creatures to attack, or use Skip Combat', { type: 'warning' });
      return;
    }
    var hasBot = (state.lastMatch?.players || []).some(function(p) { return p.isBot; });
    var res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'DECLARE_ATTACKERS', attackers: state.pendingAttackers } });
    if (!res.ok) { toast('Declare attackers failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    state.pendingAttackers = {};
    state._atkStagedCreatures = [];
    state.combatMode = null;
    if (hasBot) {
      var botCount = (state.lastMatch?.players || []).filter(function(p) { return p.isBot; }).length;
      var bar = $('#turnBar');
      var blockLabel = botCount > 1 ? 'Bots are blocking' : 'Bot is blocking';
      if (bar) bar.innerHTML = '<div class="botThinking"><span class="spinner"></span> ' + blockLabel + '\u2026</div>';
      await new Promise(function(r) { setTimeout(r, 800 + Math.floor(Math.random() * 600)); });
    }
    await refreshMatch();
    // Show bot blocking result
    if (hasBot) {
      var log = state.lastMatch?.log || [];
      var recentBlocks = [];
      for (var bi = log.length - 1; bi >= 0; bi--) {
        if (log[bi].type === 'BLOCKERS_DECLARED' && log[bi].by === 'bot' && log[bi].t > Date.now() - 5000) recentBlocks.push(log[bi]);
      }
      var totalBlocked = 0;
      for (var rbi = 0; rbi < recentBlocks.length; rbi++) totalBlocked += (recentBlocks[rbi].count || 0);
      if (totalBlocked > 0) {
        toast('Bot' + (recentBlocks.length > 1 ? 's' : '') + ' blocked with ' + totalBlocked + ' creature' + (totalBlocked > 1 ? 's' : '') + '.', { type: 'info', ms: 2000 });
      } else {
        toast('Bot' + (recentBlocks.length > 1 ? 's' : '') + ' did not block.', { type: 'info', ms: 1500 });
      }
    }
    // Show combat result summary
    var combatLog = state.lastMatch?.log || [];
    var recentDeaths = [];
    var recentDmg = [];
    var cutoff = Date.now() - 5000;
    for (var ci = combatLog.length - 1; ci >= 0; ci--) {
      if (combatLog[ci].t < cutoff) break;
      if (combatLog[ci].type === 'CREATURE_DIED') recentDeaths.push(combatLog[ci]);
      if (combatLog[ci].type === 'PLAYER_DAMAGE') recentDmg.push(combatLog[ci]);
    }
    if (recentDeaths.length || recentDmg.length) {
      var parts = [];
      if (recentDeaths.length) parts.push(recentDeaths.length + ' creature' + (recentDeaths.length > 1 ? 's' : '') + ' died');
      if (recentDmg.length) {
        var totalDmg = recentDmg.reduce(function(s, e) { return s + (e.damage || 0); }, 0);
        parts.push(totalDmg + ' damage dealt');
      }
      toast('Combat: ' + parts.join(', ') + '.', { type: 'info', ms: 2500 });
    }
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
    var totalBlockers = 0;
    for (var bk in state.pendingBlockers) {
      var bArr = state.pendingBlockers[bk];
      totalBlockers += Array.isArray(bArr) ? bArr.length : 1;
    }
    if (!totalBlockers) {
      await noBlocks();
      return;
    }
    // Client-side Menace check
    for (var mk in state.pendingBlockers) {
      if (clientHasKeyword(mk, 'Menace')) {
        var mArr = state.pendingBlockers[mk];
        var mCount = Array.isArray(mArr) ? mArr.length : 1;
        if (mCount < 2) {
          toast('Menace requires at least 2 blockers. Assign another blocker or remove the assignment.', { type: 'warn', ms: 3000 });
          return;
        }
      }
    }
    var res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'DECLARE_BLOCKERS', blockers: state.pendingBlockers } });
    if (!res.ok) { toast('Declare blockers failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    state.combatMode = null;
    state.pendingBlockers = {};
    state.selectedBlocker = null;
    var botCount = (state.lastMatch?.players || []).filter(function(p) { return p.isBot; }).length;
    if (botCount) {
      var bar = $('#turnBar');
      var thinkMsg = botCount > 1 ? 'Bots are thinking' : 'Bot is thinking';
      if (bar) bar.innerHTML = '<div class="botThinking"><span class="spinner"></span> ' + thinkMsg + '\u2026</div>';
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
    var botCount = (state.lastMatch?.players || []).filter(function(p) { return p.isBot; }).length;
    if (botCount) {
      var bar = $('#turnBar');
      var thinkMsg = botCount > 1 ? 'Bots are thinking' : 'Bot is thinking';
      if (bar) bar.innerHTML = '<div class="botThinking"><span class="spinner"></span> ' + thinkMsg + '\u2026</div>';
      await new Promise(function(r) { setTimeout(r, 800 + Math.floor(Math.random() * 600)); });
    }
    await refreshMatch();
  }

  function toggleAttacker(cardId) {
    if (!state.lastMatch) return;
    var eligible = getCombatEligibleAttackers(state.lastMatch);
    if (eligible.indexOf(cardId) < 0) return;
    // If already assigned to a target, unassign
    if (state.pendingAttackers[cardId]) {
      delete state.pendingAttackers[cardId];
      renderGame(state.lastMatch);
      return;
    }
    // If already staged, unstage
    var idx = state._atkStagedCreatures.indexOf(cardId);
    if (idx >= 0) {
      state._atkStagedCreatures.splice(idx, 1);
      renderGame(state.lastMatch);
      return;
    }
    var mySeat = state.lastMatch.viewerSeat;
    var losers = state.lastMatch.game?.losers || [];
    var opponents = (state.lastMatch.players || []).filter(function(p) {
      return p.seat !== mySeat && losers.indexOf(p.seat) < 0;
    });
    if (opponents.length <= 1) {
      // Standard or only 1 opponent — auto-target
      if (opponents.length) state.pendingAttackers[cardId] = opponents[0].seat;
    } else {
      // Commander multiplayer — stage creature for batch target assignment
      state._atkStagedCreatures.push(cardId);
    }
    renderGame(state.lastMatch);
  }

  function selectAttackTarget(seat) {
    if (!state._atkStagedCreatures.length) return;
    // Filter out any staged creatures that are no longer eligible (e.g. died since staging)
    var eligible = state.lastMatch ? getCombatEligibleAttackers(state.lastMatch) : [];
    for (var i = 0; i < state._atkStagedCreatures.length; i++) {
      if (eligible.indexOf(state._atkStagedCreatures[i]) >= 0) {
        state.pendingAttackers[state._atkStagedCreatures[i]] = seat;
      }
    }
    state._atkStagedCreatures = [];
    renderGame(state.lastMatch);
  }

  function cancelAttackTarget() {
    state._atkStagedCreatures = [];
    renderGame(state.lastMatch);
  }

  function handleBlockerClick(cardId, isMine) {
    if (isMine) {
      // Check if this creature is already assigned as a blocker — unassign it
      for (var bk in state.pendingBlockers) {
        var bArr = state.pendingBlockers[bk];
        if (Array.isArray(bArr)) {
          var idx = bArr.indexOf(cardId);
          if (idx >= 0) {
            bArr.splice(idx, 1);
            if (bArr.length === 0) delete state.pendingBlockers[bk];
            toast('Blocker unassigned.', { type: 'info', ms: 1000 });
            renderGame(state.lastMatch);
            return;
          }
        }
      }
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
      // Check keyword blocking restrictions (Flying/Reach)
      if (!clientCanBlock(state.selectedBlocker, cardId)) {
        if (clientHasKeyword(cardId, 'Flying')) {
          toast('Cannot block \u2014 only Flying or Reach creatures can block a flyer.', { type: 'warn', ms: 2000 });
        }
        state.selectedBlocker = null;
        return;
      }
      // Add to blocker array for this attacker
      if (!state.pendingBlockers[cardId]) state.pendingBlockers[cardId] = [];
      if (state.pendingBlockers[cardId].indexOf(state.selectedBlocker) < 0) {
        state.pendingBlockers[cardId].push(state.selectedBlocker);
      }
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
    var b1 = $('#btnMulligan'); var b2 = $('#btnKeep');
    var ob1 = document.getElementById('btnMulliganOverlay'); var ob2 = document.getElementById('btnKeepOverlay');
    if (b1) b1.disabled = true; if (b2) b2.disabled = true;
    if (ob1) ob1.disabled = true; if (ob2) ob2.disabled = true;
    var statusEl = document.getElementById('mulliganOverlayStatus');
    if (statusEl) statusEl.innerHTML = '<span class="spinner"></span> Drawing new hand\\u2026';
    var oldMsg = $('#mulliganMsg'); if (oldMsg) oldMsg.innerHTML = '<span class="spinner"></span> Drawing new hand\\u2026';
    const res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'MULLIGAN' } });
    if (!res.ok) {
      var errMsg = 'Failed: ' + (res.error || 'unknown');
      if (oldMsg) oldMsg.textContent = errMsg;
      if (statusEl) statusEl.textContent = errMsg;
      toast('Mulligan failed: ' + (res.error || 'unknown'), { type: 'error' });
      if (b1) b1.disabled = false; if (b2) b2.disabled = false;
      if (ob1) ob1.disabled = false; if (ob2) ob2.disabled = false;
      return;
    }
    await refreshMatch();
  }

  async function keepHand() {
    if (!state.activeMatchId) return;
    var b1 = $('#btnKeep'); var b2 = $('#btnMulligan');
    var ob1 = document.getElementById('btnKeepOverlay'); var ob2 = document.getElementById('btnMulliganOverlay');
    if (b1) b1.disabled = true; if (b2) b2.disabled = true;
    if (ob1) ob1.disabled = true; if (ob2) ob2.disabled = true;
    var statusEl = document.getElementById('mulliganOverlayStatus');
    if (statusEl) statusEl.innerHTML = '<span class="spinner"></span> Keeping\\u2026';
    var oldMsg = $('#mulliganMsg'); if (oldMsg) oldMsg.innerHTML = '<span class="spinner"></span> Keeping\\u2026';
    const res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'KEEP_HAND' } });
    if (!res.ok) {
      var errMsg = 'Failed: ' + (res.error || 'unknown');
      if (oldMsg) oldMsg.textContent = errMsg;
      if (statusEl) statusEl.textContent = errMsg;
      toast('Keep failed: ' + (res.error || 'unknown'), { type: 'error' });
      if (b1) b1.disabled = false; if (b2) b2.disabled = false;
      if (ob1) ob1.disabled = false; if (ob2) ob2.disabled = false;
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

  function showBotPlayReveal(cardId, botName, isSpell) {
    var c = cardMeta(cardId);
    if (!c) return;
    var overlay = document.createElement('div');
    overlay.className = 'botPlayReveal';
    var animImg = document.createElement('img');
    animImg.src = c.imageNormal || c.imageSmall || '';
    animImg.alt = c.name || cardId;
    overlay.appendChild(animImg);
    var label = document.createElement('div');
    label.className = 'botRevealLabel';
    label.textContent = (botName || 'Bot') + (isSpell ? ' cast' : ' played');
    overlay.appendChild(label);
    var sub = document.createElement('div');
    sub.className = 'botRevealSub';
    sub.textContent = c.name || 'Unknown card';
    overlay.appendChild(sub);
    document.body.appendChild(overlay);
    setTimeout(function() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 1500);
  }

  function showBotAttackOverlay(botName, count, targetName) {
    var board = document.getElementById('gameBoard');
    if (!board) return;
    var existing = board.querySelector('.turnOverlay');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.className = 'turnOverlay botAttackOverlay';
    var text = document.createElement('div');
    text.className = 'turnOverlayText';
    text.textContent = (botName || 'Bot') + ' attacks' + (targetName ? ' ' + targetName : '') + (count > 1 ? ' with ' + count + ' creatures!' : '!');
    overlay.appendChild(text);
    board.appendChild(overlay);
    setTimeout(function() {
      overlay.classList.add('fadeOut');
      setTimeout(function() { if (overlay.isConnected) overlay.remove(); }, 400);
    }, 1000);
  }

  function showMillReveal(cardIds) {
    return new Promise(function(resolve) {
      var overlay = document.createElement('div');
      overlay.className = 'millOverlay';
      var title = document.createElement('div');
      title.className = 'millTitle';
      title.textContent = 'Milled ' + cardIds.length + ' card' + (cardIds.length !== 1 ? 's' : '');
      overlay.appendChild(title);
      var row = document.createElement('div');
      row.className = 'millCards';
      for (var i = 0; i < cardIds.length; i++) {
        var wrap = document.createElement('div');
        wrap.style.textAlign = 'center';
        var c = cardMeta(cardIds[i]);
        var img = document.createElement('img');
        img.className = 'millCard';
        img.src = (c && (c.imageSmall || c.imageNormal)) || '';
        img.alt = (c && c.name) || cardIds[i];
        wrap.appendChild(img);
        var nameEl = document.createElement('div');
        nameEl.className = 'millCardName';
        nameEl.textContent = (c && c.name) || 'Unknown';
        wrap.appendChild(nameEl);
        row.appendChild(wrap);
      }
      overlay.appendChild(row);
      var btn = document.createElement('button');
      btn.className = 'millOk';
      btn.textContent = 'OK';
      btn.onclick = function() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); resolve(); };
      overlay.appendChild(btn);
      document.body.appendChild(overlay);
    });
  }

  function getGameBoardRelativeRect(el) {
    var board = document.getElementById('gameBoard');
    if (!board || !el) return null;
    var er = el.getBoundingClientRect();
    var br = board.getBoundingClientRect();
    return { left: er.left - br.left, top: er.top - br.top, width: er.width, height: er.height };
  }

  function processAnimationEvents(newMatch) {
    var log = newMatch?.log;
    if (!Array.isArray(log)) return;
    var startIdx = state.lastLogIndex || 0;
    state.lastLogIndex = log.length;
    if (startIdx >= log.length) return;

    for (var i = startIdx; i < log.length; i++) {
      var entry = log[i];
      if (entry.t < Date.now() - 5000) continue;

      if (entry.type === 'COMBAT_DAMAGE') {
        if (entry.atkDmg > 0) showCreatureDmgFloat(entry.atk, entry.atkDmg);
        if (entry.blkDmg > 0) showCreatureDmgFloat(entry.blk, entry.blkDmg);
      }
      if (entry.type === 'PLAYER_DAMAGE' || entry.type === 'TRAMPLE_DAMAGE') {
        showPlayerDmgFloat(entry.seat, entry.damage);
      }
      if (entry.type === 'LIFELINK') {
        showLifelinkFloat(entry.seat, entry.amount);
      }
      if (entry.type === 'CREATURE_DIED') {
        showDeathOverlay(entry.cardId);
      }
      if (entry.type === 'MILL' && entry.seat === newMatch?.viewerSeat && Array.isArray(entry.cardIds) && entry.cardIds.length) {
        // Queue mill reveal — needs to be shown after render
        (function(ids) { setTimeout(function() { showMillReveal(ids); }, 300); })(entry.cardIds);
      }
      if (entry.type === 'TURN_START' && !state._suppressTurnOverlay) {
        // Don't show turn overlay during blocker phase — it's not actually a turn change
        if (newMatch.game?.step === 'combat_blockers') continue;
        var turnSeat = entry.seat;
        var isMyTurn = turnSeat === newMatch.viewerSeat;
        var turnPlayer = (newMatch.players || []).find(function(p) { return p.seat === turnSeat; });
        var turnName = turnPlayer
          ? (turnPlayer.isBot ? turnPlayer.username : ('@' + turnPlayer.username))
          : ('Seat ' + turnSeat);
        showTurnOverlay(turnName, isMyTurn);
      }
    }
  }

  function showTurnOverlay(name, isMyTurn) {
    var board = document.getElementById('gameBoard');
    if (!board) return;
    var existing = board.querySelector('.turnOverlay');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.className = 'turnOverlay' + (isMyTurn ? ' myTurn' : '');
    var text = document.createElement('div');
    text.className = 'turnOverlayText';
    text.textContent = isMyTurn ? 'YOUR TURN' : (name + "'S TURN");
    overlay.appendChild(text);
    board.appendChild(overlay);
    setTimeout(function() {
      overlay.classList.add('fadeOut');
      setTimeout(function() { if (overlay.isConnected) overlay.remove(); }, 400);
    }, 1200);
  }

  function showCreatureDmgFloat(cardId, amount) {
    var el = document.querySelector('.cardWrap[data-card-id="' + cardId + '"]');
    if (!el) return;
    var rect = getGameBoardRelativeRect(el);
    if (!rect) return;
    var board = document.getElementById('gameBoard');
    var floater = document.createElement('div');
    floater.className = 'dmgFloat';
    floater.textContent = '-' + amount;
    var jitter = Math.round(Math.random() * 20 - 10);
    floater.style.left = (rect.left + rect.width / 2 - 10 + jitter) + 'px';
    floater.style.top = (rect.top + rect.height / 3) + 'px';
    board.appendChild(floater);
    setTimeout(function() { if (floater.parentNode) floater.parentNode.removeChild(floater); }, 1200);
  }

  function showPlayerDmgFloat(seat, amount) {
    var badge = document.querySelector('.seatPanel[data-seat="' + seat + '"] .lifeBadge');
    if (!badge) return;
    var rect = getGameBoardRelativeRect(badge);
    if (!rect) return;
    var board = document.getElementById('gameBoard');
    var floater = document.createElement('div');
    floater.className = 'dmgFloat';
    floater.textContent = '-' + amount;
    floater.style.left = (rect.left + rect.width / 2 - 10) + 'px';
    floater.style.top = (rect.top - 5) + 'px';
    board.appendChild(floater);
    setTimeout(function() { if (floater.parentNode) floater.parentNode.removeChild(floater); }, 1200);
  }

  function showLifelinkFloat(seat, amount) {
    var badge = document.querySelector('.seatPanel[data-seat="' + seat + '"] .lifeBadge');
    if (!badge) return;
    var rect = getGameBoardRelativeRect(badge);
    if (!rect) return;
    var board = document.getElementById('gameBoard');
    var floater = document.createElement('div');
    floater.className = 'dmgFloatHeal';
    floater.textContent = '+' + amount;
    floater.style.left = (rect.left + rect.width / 2 + 10) + 'px';
    floater.style.top = (rect.top - 5) + 'px';
    board.appendChild(floater);
    setTimeout(function() { if (floater.parentNode) floater.parentNode.removeChild(floater); }, 1200);
  }

  function showDeathOverlay(cardId) {
    var el = document.querySelector('.cardWrap[data-card-id="' + cardId + '"]');
    if (!el) return;
    var rect = getGameBoardRelativeRect(el);
    if (!rect) return;
    var board = document.getElementById('gameBoard');
    var overlay = document.createElement('div');
    overlay.className = 'deathOverlay';
    overlay.textContent = '\u2620';
    overlay.style.left = rect.left + 'px';
    overlay.style.top = rect.top + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
    board.appendChild(overlay);
    setTimeout(function() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 800);
  }

  function showCardFlyAnimation(cardId) {
    var srcEl = document.querySelector('.handTray .cardImg[data-card-id="' + cardId + '"]');
    if (!srcEl) return;
    var srcRect = srcEl.getBoundingClientRect();
    var bfArea = document.querySelector('#mySide .bfArea');
    if (!bfArea) return;
    var tgtRect = bfArea.getBoundingClientRect();
    var clone = document.createElement('img');
    clone.src = srcEl.src;
    clone.style.cssText = 'position:fixed;z-index:50;pointer-events:none;border-radius:10px;width:' + srcRect.width + 'px;height:' + srcRect.height + 'px;left:' + srcRect.left + 'px;top:' + srcRect.top + 'px;';
    document.body.appendChild(clone);
    var tgtX = tgtRect.left + tgtRect.width / 2 - srcRect.width / 2;
    var tgtY = tgtRect.top + tgtRect.height / 2 - srcRect.height / 2;
    clone.animate([
      { left: srcRect.left + 'px', top: srcRect.top + 'px', opacity: 1, transform: 'scale(1)' },
      { left: tgtX + 'px', top: tgtY + 'px', opacity: 0.7, transform: 'scale(0.7)' }
    ], { duration: 350, easing: 'ease-in-out', fill: 'forwards' });
    setTimeout(function() { if (clone.parentNode) clone.parentNode.removeChild(clone); }, 400);
  }

  function clientParseSpellEffects(oracleText) {
    if (!oracleText) return [];
    var effects = [];
    var dmgRe = /deals\\s+(\\d+)\\s+damage\\s+to\\s+(any target|target creature|target player|target opponent|each opponent)/gi;
    var dm;
    while ((dm = dmgRe.exec(oracleText)) !== null) {
      var tType = dm[2].toLowerCase();
      if (tType === 'target opponent') tType = 'target player';
      effects.push({ type: 'damage', amount: parseInt(dm[1], 10), targetType: tType });
    }
    var destRe = /destroy\\s+target\\s+(creature|permanent|enchantment|artifact|nonland permanent)/gi;
    var de;
    while ((de = destRe.exec(oracleText)) !== null) { effects.push({ type: 'destroy', targetType: de[1].toLowerCase() }); }
    if (!effects.some(function(e) { return e.type === 'destroy'; })) {
      var compDestRe = /destroy\\s+target\\s+[\\w\\s]+(?:,\\s*or\\s+|\\s+or\\s+)(?:creature|permanent|enchantment|artifact)/gi;
      if (compDestRe.test(oracleText)) {
        var destOracleLc = oracleText.toLowerCase();
        if (/destroy\\s+target\\s+[\\w\\s,]*creature/i.test(destOracleLc) || /or\\s+creature/i.test(destOracleLc)) {
          effects.push({ type: 'destroy', targetType: 'creature' });
        } else {
          effects.push({ type: 'destroy', targetType: 'permanent' });
        }
      }
    }
    var exileRe = /exile\\s+target\\s+(creature|permanent|nonland permanent)/gi;
    var ex;
    while ((ex = exileRe.exec(oracleText)) !== null) { effects.push({ type: 'exile', targetType: ex[1].toLowerCase() }); }
    var bounceRe = /return\\s+target\\s+(creature|permanent)\\s+to\\s+its\\s+owner'?s\\s+hand/gi;
    var bo;
    while ((bo = bounceRe.exec(oracleText)) !== null) { effects.push({ type: 'bounce', targetType: bo[1].toLowerCase() }); }
    var drawRe = /draw\\s+(\\w+)\\s+cards?/gi;
    var dr;
    var wordToNum = { a: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7 };
    while ((dr = drawRe.exec(oracleText)) !== null) { var n = parseInt(dr[1], 10); if (isNaN(n)) n = wordToNum[dr[1].toLowerCase()] || 1; effects.push({ type: 'draw', amount: n }); }
    var lifeRe = /gain\\s+(\\d+)\\s+life/gi;
    var lr;
    while ((lr = lifeRe.exec(oracleText)) !== null) { effects.push({ type: 'gainLife', amount: parseInt(lr[1], 10) }); }
    var buffRe = /target\\s+creature\\s+gets\\s+([+-]\\d+)\\/([+-]\\d+)[\\s\\S]*?until\\s+end\\s+of\\s+turn/gi;
    var br;
    while ((br = buffRe.exec(oracleText)) !== null) { effects.push({ type: 'tempBuff', power: parseInt(br[1], 10), toughness: parseInt(br[2], 10) }); }
    var kwGrantRe = /(?:and\\s+)?gains?\\s+(flying|reach|first strike|double strike|trample|deathtouch|lifelink|haste|vigilance|defender|menace|indestructible|hexproof)\\s+until\\s+end\\s+of\\s+turn/gi;
    var kr;
    while ((kr = kwGrantRe.exec(oracleText)) !== null) { effects.push({ type: 'tempKeyword', keyword: kr[1] }); }
    var treasureRe = /create\\s+(?:a|(\\d+))\\s+treasure\\s+tokens?/gi;
    var tr;
    while ((tr = treasureRe.exec(oracleText)) !== null) { effects.push({ type: 'createToken', tokenType: 'treasure', count: tr[1] ? parseInt(tr[1], 10) : 1 }); }
    var creatureTokenRe = /create\\s+(?:a|(\\d+))\\s+(\\d+)\\/(\\d+)\\s+[\\w\\s]*?([\\w]+)\\s+creature\\s+tokens?(?:\\s+with\\s+([\\w\\s]+))?/gi;
    var ctr;
    while ((ctr = creatureTokenRe.exec(oracleText)) !== null) { effects.push({ type: 'createToken', tokenType: 'creature', count: ctr[1] ? parseInt(ctr[1], 10) : 1, power: parseInt(ctr[2], 10), toughness: parseInt(ctr[3], 10), subtype: ctr[4], keywords: ctr[5] ? ctr[5].split(/\\s+and\\s+|\\s*,\\s*/) : [] }); }
    var millRe = /mill\\s+(\\w+)\\s+cards?/gi;
    var ml;
    while ((ml = millRe.exec(oracleText)) !== null) { var mNum = parseInt(ml[1], 10); if (isNaN(mNum)) mNum = wordToNum[ml[1].toLowerCase()] || 1; effects.push({ type: 'mill', amount: mNum, target: 'self' }); }
    var destroyAllRe = /destroy\\s+all\\s+(artifacts?|enchantments?|creatures?|nonland permanents?|permanents?)/gi;
    var da;
    while ((da = destroyAllRe.exec(oracleText)) !== null) { effects.push({ type: 'destroyAll', targetType: da[1].toLowerCase().replace(/s$/, '') }); }
    var putAllGyRe = /put\\s+all\\s+(creatures?)\\s+with\\s+mana\\s+value\\s+(\\d+)\\s+or\\s+(less|greater)\\s+into/gi;
    var pag;
    while ((pag = putAllGyRe.exec(oracleText)) !== null) { effects.push({ type: 'destroyAll', targetType: 'creature', cmcFilter: { value: parseInt(pag[2], 10), direction: pag[3].toLowerCase() } }); }
    var scryClientRe = /scry\\s+(\\d+)/gi;
    var scm;
    while ((scm = scryClientRe.exec(oracleText)) !== null) { effects.push({ type: 'scry', amount: parseInt(scm[1], 10) }); }
    return effects;
  }

  function clientParseModalModes(oracleText) {
    if (!oracleText) return null;
    var chooseRe = /choose\\s+(one|two|three|four|one\\s+or\\s+both|one\\s+or\\s+more)\\s*(?:\u2014|-)/i;
    var chooseMatch = chooseRe.exec(oracleText);
    if (!chooseMatch) return null;
    var choiceWord = chooseMatch[1].toLowerCase().replace(/\\s+/g, ' ');
    var wordToNum2 = { one: 1, two: 2, three: 3, four: 4 };
    var minChoices, maxChoices;
    if (choiceWord === 'one or both') { minChoices = 1; maxChoices = 2; }
    else if (choiceWord === 'one or more') { minChoices = 1; maxChoices = 99; }
    else { minChoices = wordToNum2[choiceWord] || 1; maxChoices = minChoices; }
    var bulletParts = oracleText.split('\u2022');
    var modes = [];
    for (var i = 1; i < bulletParts.length; i++) {
      var mText = bulletParts[i].trim();
      if (!mText) continue;
      var mEffects = clientParseSpellEffects(mText);
      modes.push({ text: mText, effects: mEffects });
    }
    if (modes.length < 2) return null;
    return { minChoices: minChoices, maxChoices: Math.min(maxChoices, modes.length), modes: modes };
  }

  function clientSpellNeedsTarget(effects) {
    for (var i = 0; i < effects.length; i++) {
      var e = effects[i];
      if (e.type === 'damage' && (e.targetType === 'target creature' || e.targetType === 'target player' || e.targetType === 'any target')) return true;
      if (e.type === 'destroy') return true;
      if (e.type === 'exile') return true;
      if (e.type === 'bounce') return true;
      if (e.type === 'tempBuff') return true;
      if (e.type === 'tempKeyword') return true;
    }
    return false;
  }

  function enterSpellTargetingMode(cardId, effects, selectedModes) {
    var match = state.lastMatch;
    if (!match) return;
    var mySeat = match.viewerSeat;
    var validTargets = [];
    var needsPlayer = false;
    var permFilter = null;
    for (var i = 0; i < effects.length; i++) {
      var e = effects[i];
      if (e.type === 'damage') {
        if (e.targetType === 'target creature') { if (!permFilter) permFilter = 'creature'; }
        else if (e.targetType === 'target player') needsPlayer = true;
        else if (e.targetType === 'any target') { if (!permFilter) permFilter = 'creature'; needsPlayer = true; }
      } else if (e.type === 'destroy' || e.type === 'exile' || e.type === 'bounce') {
        if (!permFilter) permFilter = e.targetType || 'creature';
      } else if (e.type === 'tempBuff' || e.type === 'tempKeyword') {
        if (!permFilter) permFilter = 'creature';
      }
    }
    if (permFilter) {
      var perms = getTargetablePermanents(match, mySeat, permFilter);
      for (var pi = 0; pi < perms.length; pi++) validTargets.push(perms[pi]);
    }
    if (needsPlayer) {
      var seats = (match.players || []).map(function(p) { return p.seat; });
      for (var si = 0; si < seats.length; si++) {
        if (seats[si] !== mySeat) validTargets.push('seat:' + seats[si]);
      }
    }
    if (!validTargets.length) {
      toast('No valid targets for this spell.', { type: 'warn', ms: 2000 });
      return;
    }
    state.targetingMode = { cardId: cardId, validTargets: validTargets, selectedTarget: null, isSpell: true };
    if (selectedModes) state.targetingMode.selectedModes = selectedModes;
    renderGame(match);
  }

  async function playSelectedToBattlefield() {
    const sel = state.selected; if (!state.activeMatchId || !sel?.id) return;
    if (!(sel.zone === 'hand' && sel.seat === state.lastMatch?.viewerSeat)) { toast('Select a card in your hand to play.', { type: 'warn' }); return; }
    if (!clientCanPlay(sel.id, state.lastMatch)) { toast('Cannot play this card right now.', { type: 'warn' }); return; }
    // Aura: enter targeting mode instead of playing directly
    if (clientIsAura(sel.id)) {
      enterTargetingMode(sel.id);
      return;
    }
    var isSpell = (clientCardType(sel.id) === 'instant' || clientCardType(sel.id) === 'sorcery');
    // Modal spell: show mode selection overlay first
    if (isSpell) {
      var oracle = String(cardMeta(sel.id)?.oracleText || '');
      var modalInfo = clientParseModalModes(oracle);
      if (modalInfo) {
        showModeSelectionOverlay(sel.id, modalInfo);
        return;
      }
      // Spell with targeted effects: enter spell targeting mode
      var effects = clientParseSpellEffects(oracle);
      if (clientSpellNeedsTarget(effects)) {
        enterSpellTargetingMode(sel.id, effects);
        return;
      }
    }
    if (!isSpell) showCardFlyAnimation(sel.id);
    const res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'PLAY_FROM_HAND', cardId: sel.id } });
    if (!res.ok) { toast('Play failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    if (isSpell) showSpellCastAnimation(sel.id);
    await refreshMatch();
    setSelected(null);
  }

  function showModeSelectionOverlay(cardId, modalInfo) {
    state.modalSelection = { cardId: cardId, modalInfo: modalInfo, selectedIndices: [] };
    var match = state.lastMatch;
    var board = document.getElementById('gameBoard');
    if (!board) return;
    var existing = board.querySelector('.modeOverlay');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.className = 'modeOverlay';
    var panel = document.createElement('div');
    panel.className = 'modePanel';
    var meta = cardMeta(cardId);
    var title = document.createElement('div');
    title.className = 'modePanelTitle';
    title.textContent = meta?.name || 'Modal Spell';
    panel.appendChild(title);
    var subtitle = document.createElement('div');
    subtitle.className = 'modePanelSubtitle';
    var chooseLabel = modalInfo.minChoices === modalInfo.maxChoices
      ? 'Choose ' + modalInfo.maxChoices
      : 'Choose ' + modalInfo.minChoices + ' to ' + modalInfo.maxChoices;
    subtitle.textContent = chooseLabel;
    panel.appendChild(subtitle);
    for (var i = 0; i < modalInfo.modes.length; i++) {
      (function(idx) {
        var opt = document.createElement('div');
        opt.className = 'modeOption';
        opt.textContent = '\u2022 ' + modalInfo.modes[idx].text;
        // Check if this mode can apply (for destroyAll, check if matching permanents exist)
        var canApply = clientCheckModeApplicable(modalInfo.modes[idx], match);
        if (!canApply) opt.classList.add('disabled');
        opt.addEventListener('click', function() {
          if (opt.classList.contains('disabled')) return;
          var selIdx = state.modalSelection.selectedIndices;
          var pos = selIdx.indexOf(idx);
          if (pos >= 0) { selIdx.splice(pos, 1); opt.classList.remove('selected'); }
          else if (selIdx.length < modalInfo.maxChoices) { selIdx.push(idx); opt.classList.add('selected'); }
          var confirmBtn = panel.querySelector('.modeBtnConfirm');
          if (confirmBtn) confirmBtn.disabled = selIdx.length < modalInfo.minChoices;
        });
        panel.appendChild(opt);
      })(i);
    }
    var controls = document.createElement('div');
    controls.className = 'modeControls';
    var confirmBtn = document.createElement('button');
    confirmBtn.className = 'modeBtnConfirm';
    confirmBtn.textContent = 'Cast';
    confirmBtn.disabled = true;
    confirmBtn.addEventListener('click', function() { confirmModalAndPlay(); });
    var cancelBtn = document.createElement('button');
    cancelBtn.className = 'modeBtnCancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', function() {
      state.modalSelection = null;
      var ov = board.querySelector('.modeOverlay');
      if (ov) ov.remove();
    });
    controls.appendChild(confirmBtn);
    controls.appendChild(cancelBtn);
    panel.appendChild(controls);
    overlay.appendChild(panel);
    board.appendChild(overlay);
  }

  function clientCheckModeApplicable(mode, match) {
    if (!mode.effects || !mode.effects.length) return true;
    for (var i = 0; i < mode.effects.length; i++) {
      var e = mode.effects[i];
      if (e.type === 'destroyAll') {
        var found = false;
        var seats = (match.players || []).map(function(p) { return p.seat; });
        for (var si = 0; si < seats.length; si++) {
          var bf = match?.game?.zones?.[seats[si]]?.battlefield || [];
          for (var ci = 0; ci < bf.length; ci++) {
            if (clientMatchesTypeFilter(bf[ci], e.targetType)) { found = true; break; }
          }
          if (found) break;
        }
        if (!found) return false;
      }
    }
    return true;
  }

  async function confirmModalAndPlay() {
    var ms = state.modalSelection;
    if (!ms) return;
    var cardId = ms.cardId;
    var selectedModes = ms.selectedIndices.slice();
    state.modalSelection = null;
    var board = document.getElementById('gameBoard');
    var ov = board?.querySelector('.modeOverlay');
    if (ov) ov.remove();
    // Collect all effects from selected modes
    var allEffects = [];
    for (var i = 0; i < selectedModes.length; i++) {
      var mode = ms.modalInfo.modes[selectedModes[i]];
      for (var j = 0; j < mode.effects.length; j++) allEffects.push(mode.effects[j]);
    }
    // If any selected mode needs a target, enter targeting mode
    if (clientSpellNeedsTarget(allEffects)) {
      enterSpellTargetingMode(cardId, allEffects, selectedModes);
      return;
    }
    // All mass/non-targeted: send directly
    showSpellCastAnimation(cardId);
    var res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'PLAY_FROM_HAND', cardId: cardId, selectedModes: selectedModes } });
    if (!res.ok) { toast('Play failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    await refreshMatch();
    setSelected(null);
  }

  function showScryOverlay(match) {
    var scry = match.game?.scryPending;
    if (!scry) return;
    var mySeat = match.viewerSeat;
    if (scry.seat !== mySeat) return; // Not our scry
    var board = document.getElementById('gameBoard');
    if (!board) return;
    var existing = board.querySelector('.scryOverlay');
    if (existing) return; // Already showing
    var overlay = document.createElement('div');
    overlay.className = 'scryOverlay';
    var panel = document.createElement('div');
    panel.className = 'scryPanel';
    var title = document.createElement('div');
    title.className = 'scryPanelTitle';
    title.textContent = 'Scry ' + scry.count;
    panel.appendChild(title);
    var subtitle = document.createElement('div');
    subtitle.className = 'scryPanelSubtitle';
    subtitle.textContent = 'Click cards to move between zones. Top cards are drawn first.';
    panel.appendChild(subtitle);
    // "Keep on top" zone
    var topLabel = document.createElement('div');
    topLabel.className = 'scryZoneLabel';
    topLabel.textContent = 'Keep on top (drawn first \u2192 last)';
    panel.appendChild(topLabel);
    var topZone = document.createElement('div');
    topZone.className = 'scryZone top';
    topZone.id = 'scryTopZone';
    panel.appendChild(topZone);
    // "Send to bottom" zone
    var botLabel = document.createElement('div');
    botLabel.className = 'scryZoneLabel';
    botLabel.textContent = 'Send to bottom';
    panel.appendChild(botLabel);
    var botZone = document.createElement('div');
    botZone.className = 'scryZone bottom';
    botZone.id = 'scryBottomZone';
    panel.appendChild(botZone);
    // Track which zone each card is in
    var cardZones = {}; // cardId -> 'top' | 'bottom'
    for (var i = 0; i < scry.cardIds.length; i++) {
      cardZones[scry.cardIds[i]] = 'top'; // Start all on top
    }
    function renderScryCards() {
      topZone.innerHTML = '';
      botZone.innerHTML = '';
      var topOrder = 0;
      for (var ci = 0; ci < scry.cardIds.length; ci++) {
        var cid = scry.cardIds[ci];
        var zone = cardZones[cid];
        var card = document.createElement('div');
        card.className = 'scryCard';
        var meta = cardMeta(cid);
        var img = document.createElement('img');
        img.src = meta?.imageSmall || meta?.imageNormal || '';
        img.alt = meta?.name || cid;
        card.appendChild(img);
        if (zone === 'top') {
          topOrder++;
          var orderBadge = document.createElement('div');
          orderBadge.className = 'scryOrder';
          orderBadge.textContent = String(topOrder);
          card.appendChild(orderBadge);
        }
        (function(cardId) {
          card.addEventListener('click', function() {
            cardZones[cardId] = cardZones[cardId] === 'top' ? 'bottom' : 'top';
            renderScryCards();
          });
        })(cid);
        if (zone === 'top') topZone.appendChild(card);
        else botZone.appendChild(card);
      }
    }
    renderScryCards();
    // Controls
    var controls = document.createElement('div');
    controls.className = 'scryControls';
    var confirmBtn = document.createElement('button');
    confirmBtn.className = 'scryBtnConfirm';
    confirmBtn.textContent = 'Confirm';
    confirmBtn.addEventListener('click', function() { confirmScryReorder(scry.cardIds, cardZones); });
    controls.appendChild(confirmBtn);
    // "All to bottom" shortcut
    var allBottomBtn = document.createElement('button');
    allBottomBtn.className = 'scryBtnCancel';
    allBottomBtn.textContent = 'All to Bottom';
    allBottomBtn.addEventListener('click', function() {
      for (var ai = 0; ai < scry.cardIds.length; ai++) cardZones[scry.cardIds[ai]] = 'bottom';
      renderScryCards();
    });
    controls.appendChild(allBottomBtn);
    panel.appendChild(controls);
    overlay.appendChild(panel);
    board.appendChild(overlay);
  }

  async function confirmScryReorder(cardIds, cardZones) {
    var topIds = [];
    var bottomIds = [];
    for (var i = 0; i < cardIds.length; i++) {
      if (cardZones[cardIds[i]] === 'top') topIds.push(cardIds[i]);
      else bottomIds.push(cardIds[i]);
    }
    var board = document.getElementById('gameBoard');
    var ov = board?.querySelector('.scryOverlay');
    if (ov) ov.remove();
    var res = await supExec('api_matchAction', {
      matchId: state.activeMatchId,
      action: { type: 'SCRY_REORDER', topIds: topIds, bottomIds: bottomIds }
    });
    if (!res.ok) { toast('Scry failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    toast('Scry resolved!', { type: 'success', ms: 1200 });
    await refreshMatch();
  }

  function showDiscardOverlay(match) {
    var dp = match?.game?.discardPending;
    if (!dp || dp.seat !== match?.viewerSeat) return;
    var hand = match?.game?.zones?.[dp.seat]?.hand || [];
    if (!hand.length) return;
    var board = document.getElementById('gameBoard');
    if (!board) return;
    var existing = board.querySelector('.discardOverlay');
    if (existing) existing.remove();
    if (!state.discardSelection) state.discardSelection = [];
    var overlay = document.createElement('div');
    overlay.className = 'discardOverlay';
    var panel = document.createElement('div');
    panel.className = 'discardPanel';
    panel.innerHTML = '<h3>Discard to Hand Size</h3>'
      + '<div class="discardSub">You have ' + hand.length + ' cards in hand. Maximum is 7. Select <strong>' + dp.mustDiscard + '</strong> card' + (dp.mustDiscard > 1 ? 's' : '') + ' to discard.</div>';
    var grid = document.createElement('div');
    grid.className = 'discardGrid';
    for (var di = 0; di < hand.length; di++) {
      var cid = hand[di];
      var c = cardMeta(cid);
      var card = document.createElement('div');
      card.className = 'discardCard' + (state.discardSelection.indexOf(cid) >= 0 ? ' discardSelected' : '');
      card.dataset.cardId = cid;
      var cImg = document.createElement('img');
      cImg.src = c?.imageSmall || c?.imageNormal || '';
      cImg.alt = c?.name || cid;
      card.appendChild(cImg);
      (function(capturedId) {
        card.onclick = function() {
          var idx = state.discardSelection.indexOf(capturedId);
          if (idx >= 0) {
            state.discardSelection.splice(idx, 1);
          } else if (state.discardSelection.length < dp.mustDiscard) {
            state.discardSelection.push(capturedId);
          }
          showDiscardOverlay(match);
        };
      })(cid);
      grid.appendChild(card);
    }
    panel.appendChild(grid);
    var counter = document.createElement('div');
    counter.style.cssText = 'text-align:center;color:rgba(255,255,255,0.6);font-size:12px;margin-bottom:8px;';
    counter.textContent = 'Selected: ' + state.discardSelection.length + ' / ' + dp.mustDiscard;
    panel.appendChild(counter);
    var actions = document.createElement('div');
    actions.className = 'discardActions';
    var confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btnPrimary';
    confirmBtn.textContent = 'Confirm Discard';
    confirmBtn.disabled = state.discardSelection.length !== dp.mustDiscard;
    confirmBtn.onclick = function() { confirmDiscard(); };
    actions.appendChild(confirmBtn);
    panel.appendChild(actions);
    overlay.appendChild(panel);
    board.appendChild(overlay);
  }

  async function confirmDiscard() {
    if (!state.activeMatchId || !state.discardSelection?.length) return;
    var res = await supExec('api_matchAction', {
      matchId: state.activeMatchId,
      action: { type: 'DISCARD_TO_HANDSIZE', cardIds: state.discardSelection }
    });
    if (!res.ok) { toast('Discard failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    state.discardSelection = null;
    toast('Discarded to hand size.', { type: 'info', ms: 1500 });
    await refreshMatch();
  }

  async function activateAbility() {
    var sel = state.selected;
    if (!state.activeMatchId || !sel?.id) return;
    if (!(sel.zone === 'battlefield' && sel.seat === state.lastMatch?.viewerSeat)) return;
    var res = await supExec('api_matchAction', {
      matchId: state.activeMatchId,
      action: { type: 'ACTIVATE_ABILITY', cardId: sel.id }
    });
    if (!res.ok) { toast('Activate failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    toast((cardMeta(sel.id)?.name || 'Card') + ' ability activated!', { type: 'success', ms: 1500 });
    await refreshMatch();
    // After refreshMatch, if scryPending is set, renderGame will show the scry overlay
    setSelected(null);
  }

  async function moveSelectedToGraveyard() {
    const sel = state.selected; if (!state.activeMatchId || !sel?.id) return;
    if (!(sel.zone === 'battlefield' && sel.seat === state.lastMatch?.viewerSeat)) { toast('Select a card on your battlefield.', { type: 'warn' }); return; }
    const res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'MOVE_BATTLEFIELD_TO_GRAVEYARD', cardId: sel.id } });
    if (!res.ok) { toast('Move failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    await refreshMatch();
    setSelected(null);
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
    $('#playBotDeck').onchange = () => { if (typeof updateDevPanel === 'function') updateDevPanel(); };
    $('#cmdBotCount').onchange = () => { renderCmdBotSlots(); if (typeof updateDevPanel === 'function') updateDevPanel(); };
    $('#playDeck').onchange = () => { if (typeof updateDevPanel === 'function') updateDevPanel(); };
    $('#btnValidateAndCreate').onclick = validateAndCreateMatch;
    $('#btnJoin').onclick = joinMatch;
    $('#btnRefreshMatch').onclick = refreshMatch;
    $('#btnDraw').onclick = drawDebug;
    $('#btnAssignDeck').onclick = assignDeckToSeat;
    $('#btnReady').onclick = toggleReady;
    $('#btnStartGame').onclick = startGame;
    $('#btnPlaySelected').onclick = playSelectedToBattlefield;
    $('#btnToGraveyard').onclick = moveSelectedToGraveyard;
    $('#btnActivate').onclick = activateAbility;
    $('#btnEquip').onclick = function() {
      if (!state.selected?.id || !clientIsEquipment(state.selected.id)) return;
      var eqCost = clientParseEquipCost(state.selected.id);
      if (eqCost === null) return;
      enterEquipTargetingMode(state.selected.id, eqCost);
    };
    $('#btnInspect').onclick = () => { if (state.selected?.id) openCardModal(state.selected.id, state.selected.zone); };
    $('#inspectFloatClose').onclick = () => setSelected(null);
    $('#cardModalClose').onclick = closeCardModal;
    $('#cardModal').onclick = (e) => { if (e.target === $('#cardModal')) closeCardModal(); };
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeCardModal(); setSelected(null); } });
    $('#btnCreateQsStandard').onclick = createQuickstartStandard;
    $('#btnCreateQsCommanderPopular').onclick = createQuickstartCommanderFromPopular;
    $('#btnQsCommanderSearch').onclick = quickstartCommanderSearch;
    $('#qsCommanderSearch').addEventListener('keydown', (e) => { if (e.key === 'Enter') quickstartCommanderSearch(); });
    $('#btnCreateQsCommanderChosen').onclick = createQuickstartCommanderFromChosen;
    $('#devToggle').onclick = toggleDevPanel;
    $('#devCopyConfig').onclick = () => { try { navigator.clipboard.writeText($('#devConfig').textContent); toast('Config copied.', { type: 'info', ms: 1500 }); } catch(e) { toast('Copy failed.', { type: 'warn' }); } };
    $('#devCopyAll').onclick = () => { try { const all = { config: _devState.lastPayload, response: _devState.lastResponse }; navigator.clipboard.writeText(JSON.stringify(all, null, 2)); toast('All dev data copied.', { type: 'info', ms: 1500 }); } catch(e) { toast('Copy failed.', { type: 'warn' }); } };
    $('#btnLeaveMatch').onclick = () => { exitMatchMode(); toast('Left match.', { type: 'info', ms: 2000 }); };
  }

  async function boot() {
    if (state.booted || state.booting) return;
    state.booting = true;
    // Always bind events early so tabs work even if boot fails
    bindEvents(); initDevPanel();
    // Detect mobile — disable Commander for match creation
    state.isMobile = window.innerWidth <= 768;
    if (state.isMobile) {
      var cmdOpt = $('#cmdFormatOpt');
      if (cmdOpt) { cmdOpt.disabled = true; cmdOpt.textContent = 'Commander \u2014 desktop only'; }
      $('#cmdDesktopHint').style.display = '';
    }
    setStatus('Waiting for Sup context\u2026');
    try {
      const boot = await supExec('api_boot');
      state.user = boot?.user || null;
      if (state.user?.username) {
        $('#userLabel').textContent = '@' + state.user.username;
      } else {
        $('#userLabel').textContent = '';
      }
      switchTab('play'); await loadDecks();
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
    if (!['W','U','B','R','G'].includes(c)) return { ok: false, error: 'color must be one of W U B R G' };
    try {
        return upsertDeckForUser(buildQuickstartStandardDeck(c));
    } catch (e) {
        var msg = String(e?.message || e || 'unknown');
        if (msg.includes('fetch') || msg.includes('ECONNREFUSED') || msg.includes('timeout')) {
            return { ok: false, error: 'Scryfall API temporarily unavailable — wait a moment and try again.' };
        }
        return { ok: false, error: msg };
    }
}

function api_createQuickstartCommanderDeck(event) {
    const { commanderId, commanderName } = event?.value || {};
    try {
        let commander = null;
        if (commanderId) { commander = scryfallFetchJsonCached(`${SCRYFALL.card}/${encodeURIComponent(String(commanderId))}`); }
        else if (commanderName) { commander = resolveCommanderByName(String(commanderName)); }
        if (!commander || commander.object !== 'card') return { ok: false, error: 'Commander not found. Scryfall may be rate-limiting — wait a moment and try again.' };
        return upsertDeckForUser(buildQuickstartCommanderDeck(commander));
    } catch (e) {
        var msg = String(e?.message || e || 'unknown');
        if (msg.includes('fetch') || msg.includes('ECONNREFUSED') || msg.includes('timeout')) {
            return { ok: false, error: 'Scryfall API temporarily unavailable — wait a moment and try again.' };
        }
        return { ok: false, error: msg };
    }
}

function api_searchCards(event) {
    const { query, limit = 20 } = event?.value || {};
    if (!query || typeof query !== "string") throw new Error("query is required");
    const url = `${SCRYFALL.search}?q=${encodeURIComponent(query + ' -type:land')}&order=name&unique=cards`;
    const json = scryfallFetchJsonCached(url);
    const data = Array.isArray(json?.data) ? json.data : [];
    return data.slice(0, Math.max(1, Math.min(50, Number(limit) || 20))).map(simplifyCard);
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

function api_createMatch(event) {
    const { format, hostDeckId, opponent } = event?.value || {};
    if (!format || !["standard","commander"].includes(format)) throw new Error("format must be standard|commander");
    if (!hostDeckId) throw new Error("hostDeckId is required");
    const opp = opponent && typeof opponent === "object" ? opponent : { type: "human" };
    const opponentType = opp.type === "bot" ? "bot" : "human";
    const deck = getUserDecks().find((d) => d.id === hostDeckId);
    if (!deck) throw new Error("deck not found");
    if (deck.format !== format) throw new Error("deck format mismatch");
    // Lightweight structural check (no Scryfall calls — full validation at deck save time)
    var deckCount = deckTotalCount(deck);
    if (deck.format === "standard" && deckCount < 30) return { ok: false, error: "Standard deck must have at least 30 cards (has " + deckCount + ")" };
    if (deck.format === "commander" && deckCount !== 60) return { ok: false, error: "Commander deck must have exactly 60 cards (has " + deckCount + ")" };
    if (deck.format === "commander" && !deck.commander) return { ok: false, error: "Commander deck requires a commander" };
    const allDecks = getUserDecks();
    // Multi-bot (Commander)
    if (opponentType === "bot" && Array.isArray(opp.bots) && opp.bots.length > 0) {
        if (opp.bots.length > 4) return { ok: false, error: "max 4 bots" };
        var resolvedBots = [];
        for (var bi = 0; bi < opp.bots.length; bi++) {
            var b = opp.bots[bi];
            var bDeck = null;
            if (b.deckId) {
                bDeck = allDecks.find(function(d) { return d.id === b.deckId; });
                if (!bDeck) return { ok: false, error: "Bot " + (bi + 1) + " deck not found" };
                if (bDeck.format !== format) return { ok: false, error: "Bot " + (bi + 1) + " deck format mismatch" };
            }
            resolvedBots.push({ difficulty: botDifficultyNormalize(b.difficulty), deck: bDeck });
        }
        const matchId = sup.uuid().slice(0, 8);
        const match = createInitialMatchState({ matchId, format, hostUser: sup.user, hostDeck: deck, opponentType, bots: resolvedBots });
        sup.chat.set(matchStoreKey(matchId), match);
        return { ok: true, matchId };
    }
    // Single bot (Standard)
    const difficulty = botDifficultyNormalize(opp.difficulty);
    var botDeck = null;
    if (opponentType === "bot" && opp.deckId) {
        botDeck = allDecks.find(function(d) { return d.id === opp.deckId; });
        if (!botDeck) return { ok: false, error: "bot deck not found" };
        if (botDeck.format !== format) return { ok: false, error: "bot deck format mismatch" };
    }
    const matchId = sup.uuid().slice(0, 8);
    const match = createInitialMatchState({ matchId, format, hostUser: sup.user, hostDeck: deck, opponentType, botDifficulty: difficulty, botDeck });
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
    // Safety net: always check for lethal damage before saving — catches any damage
    // that accumulated across actions but wasn't caught by the specific action handler
    if (res.match.phase === "playing" && res.match.game?.status !== "finished") {
        engineCheckLethalDamage(res.match);
        engineCheckGameOver(res.match);
    }
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
            json = scryfallFetchWithRetry(url);
            if (json) { scryfallCacheSet(cache, url, json); dirty = true; }
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
        cardMeta[card.id] = { name: card.name, typeLine: card.type_line || '', cmc: Number(card.cmc) || 0, power: card.power != null ? String(card.power) : null, toughness: card.toughness != null ? String(card.toughness) : null, keywords: Array.isArray(card.keywords) ? card.keywords : [], oracleText: card.oracle_text || '' };
    }
    const total = Object.values(cards).reduce((a, b) => a + (Number(b) || 0), 0);
    // Fill to 30 if short using extra low-CMC cards at 4 copies
    if (total < 30 && low.length > 4) {
        const used = new Set(Object.keys(cards));
        for (const card of low) {
            if (used.has(card.id)) continue;
            cards[card.id] = Math.min(4, 30 - Object.values(cards).reduce((a, b) => a + (Number(b) || 0), 0));
            cardMeta[card.id] = { name: card.name, typeLine: card.type_line || '', cmc: Number(card.cmc) || 0, power: card.power != null ? String(card.power) : null, toughness: card.toughness != null ? String(card.toughness) : null, keywords: Array.isArray(card.keywords) ? card.keywords : [], oracleText: card.oracle_text || '' };
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
    cards[cmd.id] = 1; cardMeta[cmd.id] = { name: cmd.name, typeLine: cmd.type_line || '', cmc: Number(cmd.cmc) || 0, power: cmd.power != null ? String(cmd.power) : null, toughness: cmd.toughness != null ? String(cmd.toughness) : null, keywords: Array.isArray(cmd.keywords) ? cmd.keywords : [], oracleText: cmd.oracle_text || '' };
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
    for (const c of chosen) { cards[c.id] = 1; cardMeta[c.id] = { name: c.name, typeLine: c.type_line || '', cmc: Number(c.cmc) || 0, power: c.power != null ? String(c.power) : null, toughness: c.toughness != null ? String(c.toughness) : null, keywords: Array.isArray(c.keywords) ? c.keywords : [], oracleText: c.oracle_text || '' }; }
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
    // Batch-fetch all cards in one Scryfall /collection call (single global cache round-trip)
    const allCards = scryfallGetCardsByIdsCached(uniqueCardIds);
    const cardById = {};
    for (const card of allCards) { if (card?.id) cardById[card.id] = card; }
    for (const cardId of uniqueCardIds) {
        const card = cardById[cardId];
        if (!card || card.object !== "card") { errors.push(`Missing card data for ${cardId}`); continue; }
        const leg = card.legalities || {};
        if (deck.format === "standard" && leg.standard !== "legal") errors.push(`${card.name} is not legal in Standard (${leg.standard || "unknown"}).`);
        if (deck.format === "commander" && leg.commander !== "legal") errors.push(`${card.name} is not legal in Commander (${leg.commander || "unknown"}).`);
        var cardTypeLine = String(card.type_line || '').toLowerCase();
        if (cardTypeLine.includes('land')) errors.push(card.name + ' is a land card (not allowed in Spark format).');
    }
    if (deck.format === "commander" && deck.commander) {
        const cmd = cardById[deck.commander];
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

function createInitialMatchState({ matchId, format, hostUser, hostDeck, opponentType, botDifficulty, botDeck, bots }) {
    const now = Date.now();
    const match = {
        v: 1, matchId, format, createdAt: now, phase: "lobby",
        hostUserId: hostUser.id, readyByUserId: { [hostUser.id]: false },
        players: [{ userId: hostUser.id, username: hostUser.username, joinedAt: now, seat: 1 }],
        game: { turn: 0, activePlayerSeat: 1, prioritySeat: 1, step: "main1", stack: [], zones: {}, lifeBySeat: {}, manaBySeat: {}, mulligansBySeat: {}, keptBySeat: {}, cardState: {}, combat: null, status: "playing", winner: null, losers: [], loserReasons: {}, stats: {} },
        decks: { 1: { deckId: hostDeck.id, format: hostDeck.format, name: hostDeck.name, commander: hostDeck.commander, cards: hostDeck.cards, cardMeta: hostDeck.cardMeta || {} } },
        botsBySeat: {},
        log: [{ t: now, type: "MATCH_CREATED", by: hostUser.username, opponentType: opponentType || "human" }],
    };
    // Multi-bot (Commander)
    if (opponentType === "bot" && Array.isArray(bots) && bots.length > 0) {
        for (var bi = 0; bi < bots.length; bi++) {
            var seat = bi + 2;
            var botNum = bi + 1;
            var botId = `bot${botNum}:${matchId}`;
            var diff = botDifficultyNormalize(bots[bi].difficulty);
            var useDeck = bots[bi].deck || hostDeck;
            match.players.push({ userId: botId, username: `Bot ${botNum}`, joinedAt: now, seat: seat, isBot: true, difficulty: diff });
            match.readyByUserId[botId] = true;
            match.botsBySeat[seat] = { difficulty: diff };
            match.decks[seat] = { deckId: useDeck.id, format: useDeck.format, name: `${useDeck.name} (Bot ${botNum})`, commander: useDeck.commander, cards: useDeck.cards, cardMeta: useDeck.cardMeta || {} };
            match.log.push({ t: now, type: "BOT_ADDED", by: "engine", seat: seat, difficulty: diff, deckName: useDeck.name });
        }
        return match;
    }
    // Single bot (Standard)
    if (opponentType === "bot") {
        const botId = `bot:${matchId}`;
        const useDeck = botDeck || hostDeck;
        match.players.push({ userId: botId, username: "MTG Bot", joinedAt: now, seat: 2, isBot: true, difficulty: botDifficultyNormalize(botDifficulty) });
        match.readyByUserId[botId] = true;
        match.botsBySeat[2] = { difficulty: botDifficultyNormalize(botDifficulty) };
        match.decks[2] = { deckId: useDeck.id, format: useDeck.format, name: `${useDeck.name} (Bot)`, commander: useDeck.commander, cards: useDeck.cards, cardMeta: useDeck.cardMeta || {} };
        match.log.push({ t: now, type: "BOT_ADDED", by: "engine", seat: 2, difficulty: botDifficultyNormalize(botDifficulty), deckName: useDeck.name });
    }
    return match;
}

var GAME_CONST = {
    HAND_SIZE: 7,
    STANDARD_LIFE: 20,
    COMMANDER_LIFE: 40,
    MAX_MANA: 10,
    MULLIGAN_LIMIT: 6,
    COMMANDER_DAMAGE_LETHAL: 21,
};

function engineRequirePlaying(match) {
    if (match.phase !== "playing") return { ok: false, error: "not in playing phase" };
    return null;
}
function engineRequireTurn(match, seat) {
    if (match.game?.activePlayerSeat != null && seat !== match.game.activePlayerSeat) return { ok: false, error: "not your turn" };
    return null;
}
function engineRequireStep(match, step) {
    if (match.game.step !== step) return { ok: false, error: "not in " + step + " step" };
    return null;
}
function engineRequireMainPhase(match) {
    if (match.game.step !== "main1" && match.game.step !== "main2") return { ok: false, error: "can only do this during a main phase" };
    return null;
}

function engineApplyAction(match, user, action) {
    const player = match.players.find((p) => p.userId === user.id);
    if (!player) return { ok: false, error: "user not in match" };

    if (match.game?.status === "finished" && action.type !== "DRAW") {
        return { ok: false, error: "game is over" };
    }

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
            // Populate cardMeta for instance IDs (e.g. "abc123:0" → same meta as "abc123")
            if (!deck.cardMeta) deck.cardMeta = {};
            for (var ei = 0; ei < expanded.length; ei++) {
                var eid = expanded[ei];
                var bid = baseCardId(eid);
                if (bid !== eid && deck.cardMeta[bid] && !deck.cardMeta[eid]) {
                    deck.cardMeta[eid] = deck.cardMeta[bid];
                }
            }
            const commanderId = match.format === "commander" ? deck.commander : null;
            const library = commanderId ? expanded.filter((id) => id !== commanderId) : expanded.slice();
            shuffleInPlace(library);
            const hand = []; for (let i = 0; i < GAME_CONST.HAND_SIZE; i++) { const top = library.shift(); if (!top) break; hand.push(top); }
            match.game.zones[seat] = { library, hand, graveyard: [], exile: [], battlefield: [], command: commanderId ? [commanderId] : [] };
            match.game.lifeBySeat[seat] = match.format === "commander" ? GAME_CONST.COMMANDER_LIFE : GAME_CONST.STANDARD_LIFE;
            if (!match.game.manaBySeat) match.game.manaBySeat = {};
            match.game.manaBySeat[seat] = { current: 0, max: 0 };
            if (!match.game.stats) match.game.stats = {};
            match.game.stats[seat] = { damageDealt: 0, creaturesKilled: 0 };
            match.game.mulligansBySeat[seat] = 0; match.game.keptBySeat[seat] = false;
            if (p.isBot) match.game.keptBySeat[seat] = true;
        }
        if (match.format === "commander") {
            match.game.commanderDamage = {};
            for (var cdp = 0; cdp < match.players.length; cdp++) { match.game.commanderDamage[match.players[cdp].seat] = {}; }
        }
        match.game.landsPlayedThisTurn = 0;
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
        const nextTaken = Math.min(GAME_CONST.MULLIGAN_LIMIT, taken + 1);
        zones.library = zones.library.concat(zones.hand || []); zones.hand = [];
        shuffleInPlace(zones.library);
        const drawN = Math.max(1, GAME_CONST.HAND_SIZE - nextTaken);
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

    // Block game actions while scry is pending — must resolve scry first
    var _scryBlockActions = ["PLAY_FROM_HAND", "MOVE_BATTLEFIELD_TO_GRAVEYARD", "ACTIVATE_ABILITY", "EQUIP", "END_TURN"];
    if (match.game?.scryPending && match.game.scryPending.seat === player?.seat && _scryBlockActions.indexOf(action.type) >= 0) {
        return { ok: false, error: "resolve scry first" };
    }
    // Block game actions while discard is pending — must discard first
    if (match.game?.discardPending && match.game.discardPending.seat === player?.seat && action.type !== "DISCARD_TO_HANDSIZE") {
        return { ok: false, error: "must discard to hand size first" };
    }

    if (action.type === "PLAY_FROM_HAND") {
        var _v; if (_v = engineRequirePlaying(match)) return _v;
        const seat = player.seat;
        var isInstantSpeed = engineCardType(match, seat, action.cardId) === "instant";
        var rw = match.game?.responseWindow;
        // Instants: playable during response window for the responding seat, or normal turn rules
        if (isInstantSpeed && rw && rw.seat === seat) {
            // Valid: playing instant during response window — skip turn/phase checks
        } else {
            if (_v = engineRequireTurn(match, seat)) return _v;
            if (_v = engineRequireMainPhase(match)) return _v;
        }
        const cardId = action.cardId; if (!cardId) return { ok: false, error: "cardId is required" };
        const cmc = Number(engineCardMeta(match, seat, cardId)?.cmc) || 0;
        const mana = match.game.manaBySeat?.[seat] || { current: 0, max: 0 };
        if (cmc > mana.current) return { ok: false, error: "not enough mana (" + cmc + " needed, " + mana.current + " available)" };
        var isLand = engineCardType(match, seat, cardId) === "land";
        if (isLand && (match.game.landsPlayedThisTurn || 0) >= 1) return { ok: false, error: "you can only play 1 land per turn" };
        var isSpell = engineIsSpell(match, seat, cardId);
        var targetId = action.targetId || null;
        // Aura targeting validation
        if (engineIsAura(match, seat, cardId)) {
            if (!targetId) return { ok: false, error: "aura requires a target creature" };
            var targetFound = false; var targetSeat = null;
            var allSeats = engineSeatOrder(match);
            for (var asi = 0; asi < allSeats.length; asi++) {
                var abf = match.game.zones?.[allSeats[asi]]?.battlefield || [];
                if (abf.indexOf(targetId) >= 0 && engineIsCreature(match, allSeats[asi], targetId)) { targetFound = true; targetSeat = allSeats[asi]; break; }
            }
            if (!targetFound) return { ok: false, error: "target must be a creature on the battlefield" };
            if (targetSeat !== seat && engineHasKeyword(match, targetSeat, targetId, "Hexproof")) return { ok: false, error: "cannot target a creature with Hexproof" };
        }
        // Spell targeting validation
        if (isSpell && !engineIsAura(match, seat, cardId)) {
            var spellEffects = engineParseSpellEffects(engineCardMeta(match, seat, cardId)?.oracleText);
            var needsTarget = engineEffectNeedsTarget(spellEffects);
            if (needsTarget && targetId) {
                // Validate creature target
                if (typeof targetId === 'string' && targetId.indexOf('seat:') === 0) {
                    var tpSeat = Number(targetId.replace('seat:', ''));
                    var validSeats2 = engineSeatOrder(match);
                    if (validSeats2.indexOf(tpSeat) < 0) return { ok: false, error: "invalid player target" };
                } else {
                    var crTargetFound = false; var crTargetSeat = null;
                    var crAllSeats = engineSeatOrder(match);
                    for (var cri = 0; cri < crAllSeats.length; cri++) {
                        var crBf = match.game.zones?.[crAllSeats[cri]]?.battlefield || [];
                        if (crBf.indexOf(targetId) >= 0) { crTargetFound = true; crTargetSeat = crAllSeats[cri]; break; }
                    }
                    if (!crTargetFound) return { ok: false, error: "target not found on battlefield" };
                    if (crTargetSeat !== seat && engineHasKeyword(match, crTargetSeat, targetId, "Hexproof")) return { ok: false, error: "cannot target a creature with Hexproof" };
                }
            }
        }
        var selectedModes = (action.selectedModes && Array.isArray(action.selectedModes)) ? action.selectedModes : null;
        const ok = enginePlayCard(match, seat, cardId, targetId, selectedModes); if (!ok.ok) return ok;
        if (isLand) match.game.landsPlayedThisTurn = (match.game.landsPlayedThisTurn || 0) + 1;
        mana.current = Math.max(0, mana.current - cmc);
        if (!match.game.stats) match.game.stats = {};
        if (!match.game.stats[seat]) match.game.stats[seat] = { damageDealt: 0, creaturesKilled: 0 };
        if (isSpell) match.game.stats[seat].spellsCast = (match.game.stats[seat].spellsCast || 0) + 1;
        match.game.stats[seat].manaSpent = (match.game.stats[seat].manaSpent || 0) + cmc;
        match.log.push({ t: Date.now(), type: isSpell ? "CAST_SPELL" : "PLAY", by: user.username, seat, cardId, targetId: targetId, selectedModes: selectedModes });
        // After playing an instant during a response window, check if we should auto-close
        if (isInstantSpeed && match.game?.responseWindow) {
            var stillHas = engineHumanHasInstants(match);
            if (!stillHas || stillHas.seat !== seat) {
                // No more instants: close response window and advance bot turn
                delete match.game.responseWindow;
                engineAdvanceTurn(match, { by: "bot" });
                engineRunBotsIfActive(match);
            }
        }
        return { ok: true, match };
    }

    if (action.type === "MOVE_BATTLEFIELD_TO_GRAVEYARD") {
        var _v; if (_v = engineRequirePlaying(match)) return _v;
        const seat = player.seat;
        if (_v = engineRequireTurn(match, seat)) return _v;
        if (_v = engineRequireMainPhase(match)) return _v;
        const cardId = action.cardId; if (!cardId) return { ok: false, error: "cardId is required" };
        const ok = engineMoveCard(match, seat, "battlefield", "graveyard", cardId); if (!ok.ok) return ok;
        match.log.push({ t: Date.now(), type: "MOVE_TO_GY", by: user.username, seat, cardId });
        return { ok: true, match };
    }

    if (action.type === "ACTIVATE_ABILITY") {
        var _v; if (_v = engineRequirePlaying(match)) return _v;
        var seat = player.seat;
        if (_v = engineRequireTurn(match, seat)) return _v;
        var cardId = action.cardId; if (!cardId) return { ok: false, error: "cardId required" };
        engineEnsureZones(match, seat);
        if (match.game.zones[seat].battlefield.indexOf(cardId) < 0) return { ok: false, error: "card not on battlefield" };
        var abMeta = engineCardMeta(match, seat, cardId);
        var abOracle = String(abMeta?.oracleText || '');
        var abResult = engineActivateAbility(match, seat, cardId, abOracle);
        if (!abResult.ok) return abResult;
        match.log.push({ t: Date.now(), type: "ACTIVATE", by: user.username, seat: seat, cardId: cardId, ability: abResult.ability });
        // Safety: check lethal damage after any ability activation (abilities may deal damage)
        engineCheckLethalDamage(match);
        engineCheckGameOver(match);
        return { ok: true, match };
    }

    if (action.type === "EQUIP") {
        var _v; if (_v = engineRequirePlaying(match)) return _v;
        var seat = player.seat;
        if (_v = engineRequireTurn(match, seat)) return _v;
        if (_v = engineRequireMainPhase(match)) return _v;
        var eqCardId = action.cardId; if (!eqCardId) return { ok: false, error: "cardId required" };
        var eqTargetId = action.targetId; if (!eqTargetId) return { ok: false, error: "targetId required" };
        engineEnsureZones(match, seat);
        if (match.game.zones[seat].battlefield.indexOf(eqCardId) < 0) return { ok: false, error: "equipment not on your battlefield" };
        if (!engineIsEquipment(match, seat, eqCardId)) return { ok: false, error: "card is not equipment" };
        if (match.game.zones[seat].battlefield.indexOf(eqTargetId) < 0) return { ok: false, error: "target creature not on your battlefield" };
        if (!engineIsCreature(match, seat, eqTargetId)) return { ok: false, error: "target must be a creature" };
        var equipCost = engineParseEquipCost(match, seat, eqCardId);
        if (equipCost === null) return { ok: false, error: "no equip cost found" };
        var mana = match.game.manaBySeat?.[seat] || { current: 0, max: 0 };
        if (equipCost > mana.current) return { ok: false, error: "not enough mana (" + equipCost + " needed, " + mana.current + " available)" };
        mana.current = Math.max(0, mana.current - equipCost);
        if (!match.game.equipmentAttachments) match.game.equipmentAttachments = {};
        match.game.equipmentAttachments[eqCardId] = eqTargetId;
        match.log.push({ t: Date.now(), type: "EQUIP", by: user.username, seat: seat, cardId: eqCardId, targetId: eqTargetId });
        if (!match.game.stats) match.game.stats = {};
        if (!match.game.stats[seat]) match.game.stats[seat] = { damageDealt: 0, creaturesKilled: 0 };
        match.game.stats[seat].manaSpent = (match.game.stats[seat].manaSpent || 0) + equipCost;
        return { ok: true, match };
    }

    if (action.type === "END_TURN") {
        var _v; if (_v = engineRequirePlaying(match)) return _v;
        const seat = player.seat;
        if (_v = engineRequireTurn(match, seat)) return _v;
        // Allow ending turn from any step — auto-skip combat if needed
        if (match.game.step === "combat_attackers" || match.game.step === "combat_blockers") {
            match.game.combat = null;
            match.log.push({ t: Date.now(), type: "COMBAT_SKIPPED", by: user.username, seat: seat });
        }
        // Check hand size limit (default 7) before ending turn
        engineEnsureZones(match, seat);
        var handSize = (match.game.zones[seat].hand || []).length;
        var maxHS = engineGetMaxHandSize(match, seat);
        if (handSize > maxHS) {
            match.game.discardPending = { seat: seat, mustDiscard: handSize - maxHS };
            match.game.step = "discard";
            return { ok: true, match };
        }
        engineAdvanceTurn(match, { by: user.username }); engineRunBotsIfActive(match);
        return { ok: true, match };
    }

    if (action.type === "DISCARD_TO_HANDSIZE") {
        var _v; if (_v = engineRequirePlaying(match)) return _v;
        var seat = player.seat;
        if (!match.game.discardPending) return { ok: false, error: "no discard pending" };
        if (match.game.discardPending.seat !== seat) return { ok: false, error: "not your discard to resolve" };
        var discardIds = action.cardIds || [];
        if (discardIds.length !== match.game.discardPending.mustDiscard) {
            return { ok: false, error: "must discard exactly " + match.game.discardPending.mustDiscard + " card(s)" };
        }
        // Validate no duplicate card IDs
        var seenIds = {};
        for (var dci = 0; dci < discardIds.length; dci++) {
            if (seenIds[discardIds[dci]]) return { ok: false, error: "duplicate card in discard list" };
            seenIds[discardIds[dci]] = true;
        }
        engineEnsureZones(match, seat);
        var curHand = match.game.zones[seat].hand || [];
        for (var dvi = 0; dvi < discardIds.length; dvi++) {
            if (curHand.indexOf(discardIds[dvi]) < 0) return { ok: false, error: "card not in hand" };
        }
        for (var dmi = 0; dmi < discardIds.length; dmi++) {
            engineMoveCard(match, seat, "hand", "graveyard", discardIds[dmi]);
        }
        match.log.push({ t: Date.now(), type: "DISCARD", by: user.username, seat: seat, count: discardIds.length });
        delete match.game.discardPending;
        engineAdvanceTurn(match, { by: user.username }); engineRunBotsIfActive(match);
        return { ok: true, match };
    }

    if (action.type === "PASS_RESPONSE") {
        var _v; if (_v = engineRequirePlaying(match)) return _v;
        var seat = player.seat;
        var rw = match.game?.responseWindow;
        if (!rw || rw.seat !== seat) return { ok: false, error: "no response window for you" };
        delete match.game.responseWindow;
        match.log.push({ t: Date.now(), type: "PASS_RESPONSE", by: user.username, seat: seat });
        // Resume: advance bot turn and continue
        engineAdvanceTurn(match, { by: "bot" });
        engineRunBotsIfActive(match);
        return { ok: true, match };
    }

    if (action.type === "SCRY_REORDER") {
        var _v; if (_v = engineRequirePlaying(match)) return _v;
        var seat = player.seat;
        var scry = match.game?.scryPending;
        if (!scry || scry.seat !== seat) return { ok: false, error: "no scry pending for you" };
        var topIds = Array.isArray(action.topIds) ? action.topIds : [];
        var bottomIds = Array.isArray(action.bottomIds) ? action.bottomIds : [];
        // Validate that all scry card IDs are accounted for
        var allScryIds = scry.cardIds.slice();
        var providedIds = topIds.concat(bottomIds);
        if (providedIds.length !== allScryIds.length) return { ok: false, error: "must assign all scried cards" };
        for (var sci = 0; sci < providedIds.length; sci++) {
            if (allScryIds.indexOf(providedIds[sci]) < 0) return { ok: false, error: "invalid card ID in scry reorder" };
        }
        engineEnsureZones(match, seat);
        var lib = match.game.zones[seat].library;
        // Remove the top N cards (they were the scried cards)
        lib.splice(0, scry.count);
        // Put top cards back on top in the order specified
        for (var sti = topIds.length - 1; sti >= 0; sti--) {
            lib.unshift(topIds[sti]);
        }
        // Put bottom cards on the bottom
        for (var sbi = 0; sbi < bottomIds.length; sbi++) {
            lib.push(bottomIds[sbi]);
        }
        delete match.game.scryPending;
        match.log.push({ t: Date.now(), type: "SCRY_RESOLVE", by: user.username, seat: seat, keptOnTop: topIds.length, sentToBottom: bottomIds.length });
        return { ok: true, match };
    }

    if (action.type === "DRAW") {
        var seat = player.seat; engineEnsureZones(match, seat);
        var drawN = Math.max(1, Math.min(7, Number(action.n) || 1));
        var drawRes = engineDrawCards(match, seat, drawN);
        if (drawRes.deckOut) {
            if (!match.game.losers) match.game.losers = [];
            if (match.game.losers.indexOf(seat) < 0) {
                match.game.losers.push(seat);
                if (!match.game.loserReasons) match.game.loserReasons = {}; match.game.loserReasons[seat] = 'deck_out';
                match.log.push({ t: Date.now(), type: "DECK_OUT", seat: seat });
                engineCheckGameOver(match);
            }
        }
        match.log.push({ t: Date.now(), type: "DRAW", by: user.username, n: drawN });
        return { ok: true, match };
    }

    if (action.type === "GO_TO_COMBAT") {
        var _v; if (_v = engineRequirePlaying(match)) return _v;
        var seat = player.seat;
        if (_v = engineRequireTurn(match, seat)) return _v;
        if (_v = engineRequireStep(match, "main1")) return _v;
        match.game.step = "combat_attackers";
        match.game.combat = { attackers: {}, blockers: {}, resolved: false };
        match.log.push({ t: Date.now(), type: "COMBAT_BEGIN", by: user.username, seat: seat });
        return { ok: true, match };
    }

    if (action.type === "DECLARE_ATTACKERS") {
        var _v; if (_v = engineRequirePlaying(match)) return _v;
        var seat = player.seat;
        if (_v = engineRequireTurn(match, seat)) return _v;
        if (_v = engineRequireStep(match, "combat_attackers")) return _v;
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
            if (engineHasKeyword(match, seat, cid, "Defender")) return { ok: false, error: "card " + cid + " has Defender and cannot attack" };
            var targetSeat = attackers[cid];
            if (targetSeat === seat) return { ok: false, error: "cannot attack yourself" };
            var validSeats = engineSeatOrder(match);
            if (validSeats.indexOf(Number(targetSeat)) < 0) return { ok: false, error: "invalid target seat " + targetSeat };
        }
        // Store attackers and tap them (Vigilance skips tapping)
        match.game.combat.attackers = {};
        for (var ai2 = 0; ai2 < attackerIds.length; ai2++) {
            var cid2 = attackerIds[ai2];
            match.game.combat.attackers[cid2] = attackers[cid2];
            if (!match.game.cardState[cid2]) match.game.cardState[cid2] = { tapped: false, summoningSick: false, damage: 0, damageSourceIds: [] };
            if (!engineHasKeyword(match, seat, cid2, "Vigilance")) {
                match.game.cardState[cid2].tapped = true;
            }
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
            match.game.prioritySeat = match.game.activePlayerSeat;
        } else {
            // Human defender — wait for blocks
            match.game.step = "combat_blockers";
            match.game.prioritySeat = humanDefenderSeat;
        }
        return { ok: true, match };
    }

    if (action.type === "SKIP_COMBAT") {
        var _v; if (_v = engineRequirePlaying(match)) return _v;
        var seat = player.seat;
        if (_v = engineRequireTurn(match, seat)) return _v;
        if (_v = engineRequireStep(match, "combat_attackers")) return _v;
        match.game.step = "main2";
        match.game.combat = null;
        match.log.push({ t: Date.now(), type: "COMBAT_SKIPPED", by: user.username, seat: seat });
        return { ok: true, match };
    }

    if (action.type === "DECLARE_BLOCKERS") {
        var _v; if (_v = engineRequirePlaying(match)) return _v;
        if (_v = engineRequireStep(match, "combat_blockers")) return _v;
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
            // Normalize to array
            var blockerArr = blockerMap[attackerId];
            if (!Array.isArray(blockerArr)) blockerArr = [blockerArr];
            // Validate attacker is targeting this seat
            if (!match.game.combat.attackers[attackerId] || Number(match.game.combat.attackers[attackerId]) !== seat) {
                return { ok: false, error: "attacker " + attackerId + " is not attacking you" };
            }
            var atkSeatForBlock = engineFindSeatForCard(match, attackerId);
            for (var bai = 0; bai < blockerArr.length; bai++) {
                var blockerId = blockerArr[bai];
                // Validate blocker on our BF
                if (myBf2.indexOf(blockerId) < 0) return { ok: false, error: "blocker " + blockerId + " not on your battlefield" };
                if (!engineIsCreature(match, seat, blockerId)) return { ok: false, error: "blocker " + blockerId + " is not a creature" };
                var bcs = match.game.cardState[blockerId];
                if (bcs && bcs.tapped) return { ok: false, error: "blocker " + blockerId + " is tapped" };
                if (usedBlockers[blockerId]) return { ok: false, error: "blocker " + blockerId + " already assigned" };
                // Flying: only Flying/Reach can block
                if (atkSeatForBlock && engineHasKeyword(match, atkSeatForBlock, attackerId, "Flying")) {
                    if (!engineHasKeyword(match, seat, blockerId, "Flying") && !engineHasKeyword(match, seat, blockerId, "Reach")) {
                        return { ok: false, error: "blocker " + blockerId + " cannot block a Flying creature without Flying or Reach" };
                    }
                }
                usedBlockers[blockerId] = true;
            }
            // Menace: require 2+ blockers
            if (atkSeatForBlock && engineHasKeyword(match, atkSeatForBlock, attackerId, "Menace") && blockerArr.length < 2) {
                return { ok: false, error: "attacker " + attackerId + " has Menace and requires at least 2 blockers" };
            }
        }
        // Store blockers as arrays
        for (var bi2 = 0; bi2 < blockerKeys.length; bi2++) {
            var bVal = blockerMap[blockerKeys[bi2]];
            match.game.combat.blockers[blockerKeys[bi2]] = Array.isArray(bVal) ? bVal : [bVal];
        }
        var totalBlockerCount = 0;
        for (var bk2 in match.game.combat.blockers) { totalBlockerCount += match.game.combat.blockers[bk2].length; }
        match.log.push({ t: Date.now(), type: "BLOCKERS_DECLARED", by: user.username, seat: seat, count: totalBlockerCount });
        engineResolveCombatDamage(match);
        if (match.game?.status === "finished") return { ok: true, match };
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
        var _v; if (_v = engineRequirePlaying(match)) return _v;
        if (_v = engineRequireStep(match, "combat_blockers")) return _v;
        var seat = player.seat;
        if (match.game.prioritySeat != null && seat !== match.game.prioritySeat) return { ok: false, error: "not your priority to declare blockers" };
        if (!match.game.combat) return { ok: false, error: "no combat in progress" };
        match.log.push({ t: Date.now(), type: "BLOCKERS_DECLARED", by: user.username, seat: seat, count: 0 });
        engineResolveCombatDamage(match);
        if (match.game?.status === "finished") return { ok: true, match };
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

    if (action.type === "CONCEDE") {
        if (match.game?.status === "finished") return { ok: false, error: "game is already over" };
        var seat = player.seat;
        if (!match.game.losers) match.game.losers = [];
        if (match.game.losers.indexOf(seat) < 0) {
            match.game.losers.push(seat);
            if (!match.game.loserReasons) match.game.loserReasons = {}; match.game.loserReasons[seat] = 'concede';
        }
        match.log.push({ t: Date.now(), type: "CONCEDE", by: user.username, seat: seat });
        engineCheckGameOver(match);
        return { ok: true, match };
    }

    return { ok: false, error: "action not implemented" };
}

function engineEnsureZones(match, seat) {
    if (!match.game) match.game = { zones: {} }; if (!match.game.zones) match.game.zones = {};
    if (!match.game.zones[seat]) match.game.zones[seat] = { library: [], hand: [], graveyard: [], exile: [], battlefield: [], command: [] };
}

function engineDrawCards(match, seat, n) {
    engineEnsureZones(match, seat); var zones = match.game.zones[seat];
    var deckOut = false;
    for (var i = 0; i < Math.max(0, Math.min(7, Number(n) || 0)); i++) { var top = zones.library.shift(); if (!top) { deckOut = true; break; } zones.hand.push(top); }
    return { ok: true, deckOut: deckOut };
}

var _auraCleanupGuard = false;
function engineMoveCard(match, seat, fromZone, toZone, cardId) {
    engineEnsureZones(match, seat); const zones = match.game.zones[seat];
    const from = zones[fromZone]; const to = zones[toZone];
    if (!Array.isArray(from)) return { ok: false, error: `zone ${fromZone} not available` };
    if (!Array.isArray(to)) return { ok: false, error: `zone ${toZone} not available` };
    const idx = from.indexOf(cardId); if (idx < 0) return { ok: false, error: `card not in ${fromZone}` };
    from.splice(idx, 1); to.push(cardId);
    if (fromZone === "battlefield" && match.game.cardState?.[cardId]) { delete match.game.cardState[cardId]; }
    // Tokens cease to exist when leaving the battlefield
    if (fromZone === 'battlefield' && (match.game.tokenIds || []).indexOf(cardId) >= 0) {
        var tokIdx = to.indexOf(cardId);
        if (tokIdx >= 0) to.splice(tokIdx, 1);
        if (match.decks?.[seat]?.cardMeta?.[cardId]) delete match.decks[seat].cardMeta[cardId];
        var tokListIdx = match.game.tokenIds.indexOf(cardId);
        if (tokListIdx >= 0) match.game.tokenIds.splice(tokListIdx, 1);
    }
    // Aura cleanup when card leaves battlefield
    if (fromZone === "battlefield" && match.game.auraAttachments) {
        // If this card is an aura, remove its attachment entry and check if enchanted creature now has lethal damage
        var auraTargetId = match.game.auraAttachments[cardId] || null;
        if (match.game.auraAttachments[cardId]) { delete match.game.auraAttachments[cardId]; }
        if (auraTargetId && !_auraCleanupGuard) {
            _auraCleanupGuard = true;
            engineCheckLethalDamage(match);
            _auraCleanupGuard = false;
        }
        // If this card is a creature, detach all auras and move them to their owner's GY
        var aurasToDetach = [];
        for (var auraId in match.game.auraAttachments) {
            if (match.game.auraAttachments[auraId] === cardId) aurasToDetach.push(auraId);
        }
        for (var adi = 0; adi < aurasToDetach.length; adi++) {
            var detachedAuraId = aurasToDetach[adi];
            delete match.game.auraAttachments[detachedAuraId];
            var auraSeat = engineFindSeatForCard(match, detachedAuraId);
            if (auraSeat != null) {
                engineMoveCard(match, auraSeat, "battlefield", "graveyard", detachedAuraId);
            }
        }
    }
    // Equipment cleanup when card leaves battlefield
    if (fromZone === "battlefield" && match.game.equipmentAttachments) {
        // If this card is equipment leaving battlefield, remove its attachment entry
        if (match.game.equipmentAttachments[cardId]) {
            delete match.game.equipmentAttachments[cardId];
        }
        // If this card is a creature, detach all equipment (equipment STAYS on battlefield, just becomes unattached)
        for (var eqId in match.game.equipmentAttachments) {
            if (match.game.equipmentAttachments[eqId] === cardId) {
                delete match.game.equipmentAttachments[eqId];
                // Equipment stays on battlefield — no zone move needed
            }
        }
    }
    return { ok: true };
}

function engineSeatOrder(match) { return (match.players || []).map((p) => p.seat).filter((n) => Number.isFinite(n)).sort((a, b) => a - b); }

function engineNextSeat(match, currentSeat) {
    const seats = engineSeatOrder(match); if (!seats.length) return 1;
    const losers = match.game?.losers || [];
    const idx = seats.indexOf(Number(currentSeat) || seats[0]);
    // Skip eliminated players
    for (var ni = 1; ni <= seats.length; ni++) {
        var candidate = seats[(idx < 0 ? 0 : idx + ni) % seats.length];
        if (losers.indexOf(candidate) < 0) return candidate;
    }
    return seats[(idx < 0 ? 0 : idx + 1) % seats.length];
}

function engineGetMaxHandSize(match, seat) {
    // Default is 7. Cards with "no maximum hand size" (Reliquary Tower, Thought Vessel, etc.) override to Infinity
    engineEnsureZones(match, seat);
    var bf = match.game.zones[seat]?.battlefield || [];
    for (var i = 0; i < bf.length; i++) {
        var oracle = String(engineCardMeta(match, seat, bf[i])?.oracleText || "").toLowerCase();
        if (oracle.indexOf("no maximum hand size") >= 0 || oracle.indexOf("have no maximum hand size") >= 0) return Infinity;
    }
    return 7;
}

function engineAdvanceTurn(match, opts) {
    const cur = match.game?.activePlayerSeat || 1;
    const next = engineNextSeat(match, cur);
    if (next <= cur) match.game.turn = (Number(match.game.turn) || 1) + 1;
    match.game.activePlayerSeat = next; match.game.prioritySeat = next;
    match.game.step = "main1";
    if (!match.game.manaBySeat) match.game.manaBySeat = {};
    const mana = match.game.manaBySeat[next] || { current: 0, max: 0 };
    mana.max = Math.min(GAME_CONST.MAX_MANA, mana.max + 1);
    mana.current = mana.max;
    match.game.manaBySeat[next] = mana;
    match.game.landsPlayedThisTurn = 0;
    engineEnsureZones(match, next); var drawResult = engineDrawCards(match, next, 1);
    if (drawResult.deckOut) {
        if (!match.game.losers) match.game.losers = [];
        if (match.game.losers.indexOf(next) < 0) {
            match.game.losers.push(next);
            if (!match.game.loserReasons) match.game.loserReasons = {}; match.game.loserReasons[next] = 'deck_out';
            match.log.push({ t: Date.now(), type: "DECK_OUT", seat: next });
            engineCheckGameOver(match);
        }
    }
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
        for (var di = 0; di < sBf.length; di++) { if (match.game.cardState[sBf[di]]) { match.game.cardState[sBf[di]].damage = 0; match.game.cardState[sBf[di]].damageSourceIds = []; } }
    }
    // Clear temp buffs and check lethal
    if (match.game.tempBuffs && match.game.tempBuffs.length) {
        match.game.tempBuffs = [];
        engineCheckLethalDamage(match);
    }
    // Clear temp keywords
    if (match.game.tempKeywords && match.game.tempKeywords.length) {
        match.game.tempKeywords = [];
    }
    // Clear combat state
    match.game.combat = null;
    match.log.push({ t: Date.now(), type: "TURN_START", by: (opts || {}).by || "engine", turn: match.game.turn, seat: next });
}

function enginePickWeakestOpponent(match, seat) {
    var allSeats = engineSeatOrder(match);
    var losers = match.game?.losers || [];
    var best = null; var bestLife = Infinity;
    for (var i = 0; i < allSeats.length; i++) {
        if (allSeats[i] === seat || losers.indexOf(allSeats[i]) >= 0) continue;
        var life = match.game.lifeBySeat?.[allSeats[i]] ?? 40;
        if (life < bestLife) { bestLife = life; best = allSeats[i]; }
    }
    return best || null;
}

function engineHumanHasInstants(match) {
    // Check if any human player has castable instants (for response window)
    var humans = (match.players || []).filter(function(p) { return !p.isBot; });
    for (var hi = 0; hi < humans.length; hi++) {
        var hSeat = humans[hi].seat;
        if ((match.game.losers || []).indexOf(hSeat) >= 0) continue;
        var hHand = match.game.zones?.[hSeat]?.hand || [];
        var hMana = match.game.manaBySeat?.[hSeat] || { current: 0, max: 0 };
        for (var ci = 0; ci < hHand.length; ci++) {
            if (engineCardType(match, hSeat, hHand[ci]) === "instant") {
                var cmc = Number(engineCardMeta(match, hSeat, hHand[ci])?.cmc) || 0;
                if (cmc <= hMana.current) return { seat: hSeat, hasInstants: true };
            }
        }
    }
    return null;
}

function engineRunBotsIfActive(match) {
    var guard = 0;
    while (guard++ < 6) {
        if (match.game?.status === "finished") break;
        if (match.game?.step === "combat_blockers") break;
        if (match.game?.responseWindow) break; // paused for human response
        var botPlayer = (match.players || []).find(function(p) { return p.isBot && p.seat === match.game?.activePlayerSeat; });
        if (!botPlayer) break;
        engineBotTakeTurn(match, botPlayer);
    }
}

function engineGetCreaturePower(match, seat, cardId) {
    var base = Number(engineCardMeta(match, seat, cardId)?.power) || 0;
    var auras = match.game?.auraAttachments || {};
    for (var auraId in auras) {
        if (auras[auraId] === cardId) {
            var auraSeat = engineFindSeatForCard(match, auraId);
            if (auraSeat != null) base += engineParseAuraMods(match, auraSeat, auraId).power;
        }
    }
    var equips = match.game?.equipmentAttachments || {};
    for (var eqId in equips) {
        if (equips[eqId] === cardId) {
            var eqSeat = engineFindSeatForCard(match, eqId);
            if (eqSeat != null) base += engineParseEquipmentMods(match, eqSeat, eqId).power;
        }
    }
    var buffs = match.game?.tempBuffs || [];
    for (var bi = 0; bi < buffs.length; bi++) { if (buffs[bi].cardId === cardId) base += buffs[bi].power; }
    return base;
}
function engineGetCreatureToughness(match, seat, cardId) {
    var base = Number(engineCardMeta(match, seat, cardId)?.toughness) || 0;
    var auras = match.game?.auraAttachments || {};
    for (var auraId in auras) {
        if (auras[auraId] === cardId) {
            var auraSeat = engineFindSeatForCard(match, auraId);
            if (auraSeat != null) base += engineParseAuraMods(match, auraSeat, auraId).toughness;
        }
    }
    var equips = match.game?.equipmentAttachments || {};
    for (var eqId in equips) {
        if (equips[eqId] === cardId) {
            var eqSeat = engineFindSeatForCard(match, eqId);
            if (eqSeat != null) base += engineParseEquipmentMods(match, eqSeat, eqId).toughness;
        }
    }
    var buffs = match.game?.tempBuffs || [];
    for (var bi = 0; bi < buffs.length; bi++) { if (buffs[bi].cardId === cardId) base += buffs[bi].toughness; }
    return base;
}


function engineGetKeywords(match, seat, cardId) {
    var meta = engineCardMeta(match, seat, cardId);
    return (meta && Array.isArray(meta.keywords)) ? meta.keywords : [];
}
function engineHasKeyword(match, seat, cardId, keyword) {
    var kws = engineGetKeywords(match, seat, cardId);
    for (var i = 0; i < kws.length; i++) { if (kws[i] === keyword) return true; }
    var tempKws = match.game?.tempKeywords || [];
    for (var ti = 0; ti < tempKws.length; ti++) {
        if (tempKws[ti].cardId === cardId && tempKws[ti].keyword === keyword) return true;
    }
    return false;
}
// Check keyword on a card that may be in graveyard (for deathtouch source tracking)
function engineHasKeywordAnySeat(match, cardId, keyword) {
    var seats = engineSeatOrder(match);
    for (var i = 0; i < seats.length; i++) {
        var meta = engineCardMeta(match, seats[i], cardId);
        if (meta && Array.isArray(meta.keywords)) {
            for (var j = 0; j < meta.keywords.length; j++) { if (meta.keywords[j] === keyword) return true; }
        }
    }
    return false;
}

function engineFindSeatForCard(match, cardId) {
    var seats = engineSeatOrder(match);
    for (var i = 0; i < seats.length; i++) {
        var bf = match.game.zones?.[seats[i]]?.battlefield || [];
        if (bf.indexOf(cardId) >= 0) return seats[i];
    }
    return null;
}

function engineIsAura(match, seat, cardId) {
    var tl = String(engineCardMeta(match, seat, cardId)?.typeLine || "").toLowerCase();
    return tl.includes("enchantment") && tl.includes("aura");
}

function engineParseAuraMods(match, seat, cardId) {
    var meta = engineCardMeta(match, seat, cardId);
    var oracle = String(meta?.oracleText || "");
    var pw = 0; var tw = 0;
    var re = /([+-]\d+)\/([+-]\d+)/g;
    var m;
    while ((m = re.exec(oracle)) !== null) { pw += parseInt(m[1], 10); tw += parseInt(m[2], 10); }
    return { power: pw, toughness: tw };
}

function engineIsEquipment(match, seat, cardId) {
    var tl = String(engineCardMeta(match, seat, cardId)?.typeLine || "").toLowerCase();
    return tl.includes("equipment");
}

function engineParseEquipCost(match, seat, cardId) {
    var oracle = String(engineCardMeta(match, seat, cardId)?.oracleText || "");
    var re = /equip\s*(?:\{(\d+)\}|(\d+))/i;
    var m = re.exec(oracle);
    if (m) return parseInt(m[1] || m[2], 10);
    return null;
}

function engineParseEquipmentMods(match, seat, cardId) {
    var oracle = String(engineCardMeta(match, seat, cardId)?.oracleText || "");
    var pw = 0; var tw = 0;
    var re = /equipped creature gets\s+([+-]\d+)\/([+-]\d+)/gi;
    var m;
    while ((m = re.exec(oracle)) !== null) { pw += parseInt(m[1], 10); tw += parseInt(m[2], 10); }
    if (pw === 0 && tw === 0) {
        var re2 = /([+-]\d+)\/([+-]\d+)/g;
        while ((m = re2.exec(oracle)) !== null) { pw += parseInt(m[1], 10); tw += parseInt(m[2], 10); }
    }
    return { power: pw, toughness: tw };
}

function engineResolveCombatDamage(match) {
    if (!match.game.combat) return;
    var attackers = match.game.combat.attackers || {};
    var blockers = match.game.combat.blockers || {};
    if (!match.game.cardState) match.game.cardState = {};
    if (!match.game.lifeBySeat) match.game.lifeBySeat = {};
    var attackerIds = Object.keys(attackers);

    // Determine if any combatant has first strike or double strike
    var hasFirstStrike = false;
    for (var fi = 0; fi < attackerIds.length && !hasFirstStrike; fi++) {
        var fAtkId = attackerIds[fi];
        var fAtkSeat = engineFindSeatForCard(match, fAtkId);
        if (fAtkSeat && (engineHasKeyword(match, fAtkSeat, fAtkId, "First Strike") || engineHasKeyword(match, fAtkSeat, fAtkId, "Double Strike"))) { hasFirstStrike = true; break; }
        var fBlkArr = blockers[fAtkId];
        if (fBlkArr) {
            var fBlkList = Array.isArray(fBlkArr) ? fBlkArr : [fBlkArr];
            for (var fbi = 0; fbi < fBlkList.length; fbi++) {
                var fBlkSeat = engineFindSeatForCard(match, fBlkList[fbi]);
                if (fBlkSeat && (engineHasKeyword(match, fBlkSeat, fBlkList[fbi], "First Strike") || engineHasKeyword(match, fBlkSeat, fBlkList[fbi], "Double Strike"))) { hasFirstStrike = true; break; }
            }
        }
    }

    if (hasFirstStrike) {
        // FIRST STRIKE STEP
        engineCombatDamageStep(match, attackers, blockers, "first_strike");
        engineCheckLethalDamage(match);
        engineCheckGameOver(match);
        if (match.game?.status === "finished") { match.game.combat.resolved = true; match.log.push({ t: Date.now(), type: "COMBAT_RESOLVED" }); return; }
    }

    // NORMAL DAMAGE STEP
    engineCombatDamageStep(match, attackers, blockers, "normal");
    engineCheckLethalDamage(match);
    engineCheckGameOver(match);
    match.game.combat.resolved = true;
    match.log.push({ t: Date.now(), type: "COMBAT_RESOLVED" });
}

function engineEnsureCardState(match, cardId) {
    if (!match.game.cardState) match.game.cardState = {};
    if (!match.game.cardState[cardId]) match.game.cardState[cardId] = { tapped: false, summoningSick: false, damage: 0, damageSourceIds: [] };
    if (!match.game.cardState[cardId].damageSourceIds) match.game.cardState[cardId].damageSourceIds = [];
}

function engineCreateToken(match, seat, tokenDef) {
    var tokenId = 'tok_' + sup.uuid().slice(0, 8);
    engineEnsureZones(match, seat);
    match.game.zones[seat].battlefield.push(tokenId);
    if (!match.decks) match.decks = {};
    if (!match.decks[seat]) match.decks[seat] = { cardMeta: {} };
    if (!match.decks[seat].cardMeta) match.decks[seat].cardMeta = {};
    match.decks[seat].cardMeta[tokenId] = {
        name: tokenDef.name || 'Token',
        typeLine: tokenDef.typeLine || 'Token',
        oracleText: tokenDef.oracleText || '',
        power: tokenDef.power != null ? String(tokenDef.power) : null,
        toughness: tokenDef.toughness != null ? String(tokenDef.toughness) : null,
        keywords: tokenDef.keywords || [],
        cmc: 0, imageSmall: null, imageNormal: null, isToken: true,
    };
    if (!match.game.tokenIds) match.game.tokenIds = [];
    match.game.tokenIds.push(tokenId);
    if (tokenDef.typeLine && tokenDef.typeLine.toLowerCase().includes('creature')) {
        engineEnsureCardState(match, tokenId);
        match.game.cardState[tokenId].summoningSick = true;
    }
    match.log.push({ t: Date.now(), type: "CREATE_TOKEN", seat: seat, tokenId: tokenId, name: tokenDef.name });
    return tokenId;
}

function engineTrackCommanderDamage(match, atkSeat, atkId, defSeat, amount) {
    if (!match.game.commanderDamage || amount <= 0) return;
    // Check if attacker is a commander
    var deckData = match.decks?.[atkSeat];
    if (!deckData || deckData.commander !== atkId) return;
    if (!match.game.commanderDamage[defSeat]) match.game.commanderDamage[defSeat] = {};
    match.game.commanderDamage[defSeat][atkId] = (match.game.commanderDamage[defSeat][atkId] || 0) + amount;
}

function engineApplyPlayerDamage(match, atkSeat, atkId, defSeat, amount) {
    if (amount <= 0) return;
    if (match.game.lifeBySeat[defSeat] != null) {
        match.game.lifeBySeat[defSeat] = Math.max(0, match.game.lifeBySeat[defSeat] - amount);
    }
    if (!match.game.stats) match.game.stats = {};
    if (!match.game.stats[atkSeat]) match.game.stats[atkSeat] = { damageDealt: 0, creaturesKilled: 0 };
    match.game.stats[atkSeat].damageDealt = (match.game.stats[atkSeat].damageDealt || 0) + amount;
    match.log.push({ t: Date.now(), type: "PLAYER_DAMAGE", seat: defSeat, damage: amount, by: atkId });
    engineTrackCommanderDamage(match, atkSeat, atkId, defSeat, amount);
    if (engineHasKeyword(match, atkSeat, atkId, "Lifelink")) {
        match.game.lifeBySeat[atkSeat] = (match.game.lifeBySeat[atkSeat] || 0) + amount;
        match.log.push({ t: Date.now(), type: "LIFELINK", seat: atkSeat, amount: amount, by: atkId });
    }
}

function engineCombatDamageStep(match, attackers, blockers, step) {
    if (!match.game.cardState) match.game.cardState = {};
    if (!match.game.lifeBySeat) match.game.lifeBySeat = {};
    var attackerIds = Object.keys(attackers);

    for (var i = 0; i < attackerIds.length; i++) {
        var atkId = attackerIds[i];
        var defSeat = Number(attackers[atkId]);
        var atkSeat = engineFindSeatForCard(match, atkId);
        if (!atkSeat) continue;
        var atkPower = engineGetCreaturePower(match, atkSeat, atkId);

        var atkHasFS = engineHasKeyword(match, atkSeat, atkId, "First Strike");
        var atkHasDS = engineHasKeyword(match, atkSeat, atkId, "Double Strike");
        var atkDeals = false;
        if (step === "first_strike") { atkDeals = atkHasFS || atkHasDS; }
        else { atkDeals = !atkHasFS || atkHasDS; }

        // Normalize blockers to array
        var rawBlk = blockers[atkId];
        var blkArr = rawBlk ? (Array.isArray(rawBlk) ? rawBlk : [rawBlk]) : [];

        // Filter to alive blockers (still on battlefield)
        var aliveBlockers = [];
        for (var ab = 0; ab < blkArr.length; ab++) {
            var bSeat = engineFindSeatForCard(match, blkArr[ab]);
            if (bSeat) {
                var bBf = match.game.zones?.[bSeat]?.battlefield || [];
                if (bBf.indexOf(blkArr[ab]) >= 0) aliveBlockers.push({ id: blkArr[ab], seat: bSeat });
            }
        }

        if (blkArr.length > 0 && aliveBlockers.length === 0) {
            // All blockers died in first strike — attacker hits player
            if (atkDeals && atkPower > 0) {
                engineApplyPlayerDamage(match, atkSeat, atkId, defSeat, atkPower);
            }
            continue;
        }

        if (aliveBlockers.length > 0) {
            // Blocked combat — multiple blockers possible
            engineEnsureCardState(match, atkId);

            // Attacker deals damage distributed among blockers
            if (atkDeals && atkPower > 0) {
                var hasTrample = engineHasKeyword(match, atkSeat, atkId, "Trample");
                var hasDeathtouch = engineHasKeyword(match, atkSeat, atkId, "Deathtouch");
                var remainingDmg = atkPower;
                var totalDmgToBlockers = 0;

                if (hasTrample) {
                    // Trample: assign minimum lethal to each blocker, excess to player
                    for (var tb = 0; tb < aliveBlockers.length; tb++) {
                        var tBlk = aliveBlockers[tb];
                        engineEnsureCardState(match, tBlk.id);
                        var tTough = engineGetCreatureToughness(match, tBlk.seat, tBlk.id);
                        var tExisting = Number(match.game.cardState[tBlk.id].damage) || 0;
                        var tLethal = tTough - tExisting;
                        if (hasDeathtouch && tLethal > 1) tLethal = 1;
                        if (tLethal < 0) tLethal = 0;
                        var tAssign = Math.min(remainingDmg, tLethal);
                        if (tAssign > 0) {
                            match.game.cardState[tBlk.id].damage = (Number(match.game.cardState[tBlk.id].damage) || 0) + tAssign;
                            match.game.cardState[tBlk.id].damageSourceIds.push(atkId);
                            totalDmgToBlockers += tAssign;
                        }
                        remainingDmg -= tAssign;
                    }
                    // Excess tramples to player
                    if (remainingDmg > 0) {
                        engineApplyPlayerDamage(match, atkSeat, atkId, defSeat, remainingDmg);
                        // player damage handled by helper (includes lifelink)
                    }
                    // Lifelink for damage to blockers only (player lifelink handled in helper)
                    if (totalDmgToBlockers > 0 && engineHasKeyword(match, atkSeat, atkId, "Lifelink")) {
                        match.game.lifeBySeat[atkSeat] = (match.game.lifeBySeat[atkSeat] || 0) + totalDmgToBlockers;
                        match.log.push({ t: Date.now(), type: "LIFELINK", seat: atkSeat, amount: totalDmgToBlockers, by: atkId });
                    }
                } else {
                    // No trample: distribute evenly among blockers
                    var perBlocker = Math.floor(atkPower / aliveBlockers.length);
                    var extraDmg = atkPower - (perBlocker * aliveBlockers.length);
                    for (var db = 0; db < aliveBlockers.length; db++) {
                        var dBlk = aliveBlockers[db];
                        engineEnsureCardState(match, dBlk.id);
                        var dmgForThis = perBlocker + (db === 0 ? extraDmg : 0);
                        if (dmgForThis > 0) {
                            match.game.cardState[dBlk.id].damage = (Number(match.game.cardState[dBlk.id].damage) || 0) + dmgForThis;
                            match.game.cardState[dBlk.id].damageSourceIds.push(atkId);
                        }
                    }
                    // Lifelink
                    if (engineHasKeyword(match, atkSeat, atkId, "Lifelink")) {
                        match.game.lifeBySeat[atkSeat] = (match.game.lifeBySeat[atkSeat] || 0) + atkPower;
                        match.log.push({ t: Date.now(), type: "LIFELINK", seat: atkSeat, amount: atkPower, by: atkId });
                    }
                }
            }

            // Each alive blocker deals damage back to attacker
            for (var rb = 0; rb < aliveBlockers.length; rb++) {
                var rBlk = aliveBlockers[rb];
                var rBlkPower = engineGetCreaturePower(match, rBlk.seat, rBlk.id);
                var rBlkHasFS = engineHasKeyword(match, rBlk.seat, rBlk.id, "First Strike");
                var rBlkHasDS = engineHasKeyword(match, rBlk.seat, rBlk.id, "Double Strike");
                var rBlkDeals = false;
                if (step === "first_strike") { rBlkDeals = rBlkHasFS || rBlkHasDS; }
                else { rBlkDeals = !rBlkHasFS || rBlkHasDS; }
                if (rBlkDeals && rBlkPower > 0) {
                    match.game.cardState[atkId].damage = (Number(match.game.cardState[atkId].damage) || 0) + rBlkPower;
                    match.game.cardState[atkId].damageSourceIds.push(rBlk.id);
                    if (engineHasKeyword(match, rBlk.seat, rBlk.id, "Lifelink")) {
                        match.game.lifeBySeat[rBlk.seat] = (match.game.lifeBySeat[rBlk.seat] || 0) + rBlkPower;
                        match.log.push({ t: Date.now(), type: "LIFELINK", seat: rBlk.seat, amount: rBlkPower, by: rBlk.id });
                    }
                }
            }
            match.log.push({ t: Date.now(), type: "COMBAT_DAMAGE", atk: atkId, blk: aliveBlockers.map(function(b) { return b.id; }), step: step });
        } else {
            // Unblocked — damage to player
            if (atkDeals && atkPower > 0) {
                engineApplyPlayerDamage(match, atkSeat, atkId, defSeat, atkPower);
            }
        }
    }
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
            var shouldDie = false;
            // State-based: creature with 0 or less toughness dies (e.g. from -N/-N debuff)
            if (tough <= 0) {
                shouldDie = true;
            } else {
                // Lethal damage check
                var isLethal = dmg >= tough;
                // Deathtouch: any damage from a Deathtouch source is lethal
                if (!isLethal && dmg > 0 && Array.isArray(cs.damageSourceIds)) {
                    for (var di = 0; di < cs.damageSourceIds.length; di++) {
                        if (engineHasKeywordAnySeat(match, cs.damageSourceIds[di], "Deathtouch")) { isLethal = true; break; }
                    }
                }
                if (isLethal) shouldDie = true;
            }
            if (shouldDie) {
                // Indestructible: survives lethal damage and 0 toughness from damage
                if (engineHasKeyword(match, seat, cid, "Indestructible")) continue;
                var moveResult = engineMoveCard(match, seat, "battlefield", "graveyard", cid);
                if (!moveResult.ok) continue; // Move failed — don't log death
                // Track kills for opposing seats
                if (!match.game.stats) match.game.stats = {};
                var otherSeats = engineSeatOrder(match);
                for (var ki = 0; ki < otherSeats.length; ki++) {
                    if (otherSeats[ki] !== seat) {
                        if (!match.game.stats[otherSeats[ki]]) match.game.stats[otherSeats[ki]] = { damageDealt: 0, creaturesKilled: 0 };
                        match.game.stats[otherSeats[ki]].creaturesKilled = (match.game.stats[otherSeats[ki]].creaturesKilled || 0) + 1;
                    }
                }
                match.log.push({ t: Date.now(), type: "CREATURE_DIED", seat: seat, cardId: cid, damage: dmg, toughness: tough });
            }
        }
    }
}

function engineCheckGameOver(match) {
    if (!match.game) return;
    if (match.game.status === "finished") return;
    if (!match.game.losers) match.game.losers = [];
    var seats = engineSeatOrder(match);
    // Check life totals
    for (var i = 0; i < seats.length; i++) {
        var s = seats[i];
        if (match.game.losers.indexOf(s) >= 0) continue;
        if (match.game.lifeBySeat[s] != null && match.game.lifeBySeat[s] <= 0) {
            match.game.losers.push(s);
            if (!match.game.loserReasons) match.game.loserReasons = {}; match.game.loserReasons[s] = 'life';
            var lp = (match.players || []).find(function(p) { return p.seat === s; });
            match.log.push({ t: Date.now(), type: "PLAYER_ELIMINATED", seat: s, by: lp ? lp.username : "seat " + s, reason: "life" });
        }
    }
    // Check commander damage (21+)
    if (match.game.commanderDamage) {
        for (var ci = 0; ci < seats.length; ci++) {
            var cs = seats[ci];
            if (match.game.losers.indexOf(cs) >= 0) continue;
            var cdMap = match.game.commanderDamage[cs] || {};
            for (var cmdId in cdMap) {
                if (cdMap[cmdId] >= GAME_CONST.COMMANDER_DAMAGE_LETHAL) {
                    match.game.losers.push(cs);
                    if (!match.game.loserReasons) match.game.loserReasons = {}; match.game.loserReasons[cs] = 'commander_damage';
                    var clp = (match.players || []).find(function(p) { return p.seat === cs; });
                    match.log.push({ t: Date.now(), type: "PLAYER_ELIMINATED", seat: cs, by: clp ? clp.username : "seat " + cs, reason: "commander_damage" });
                    break;
                }
            }
        }
    }
    // Move eliminated players' battlefield to graveyard
    for (var eli = 0; eli < match.game.losers.length; eli++) {
        var elSeat = match.game.losers[eli];
        engineEnsureZones(match, elSeat);
        var elBf = match.game.zones[elSeat].battlefield;
        while (elBf.length) {
            var elCard = elBf[0];
            engineMoveCard(match, elSeat, "battlefield", "graveyard", elCard);
        }
    }
    // Determine winner
    var alive = [];
    for (var j = 0; j < seats.length; j++) {
        if (match.game.losers.indexOf(seats[j]) < 0) alive.push(seats[j]);
    }
    if (alive.length <= 1 && seats.length >= 2) {
        match.game.status = "finished";
        match.phase = "finished";
        match.game.winner = alive.length === 1 ? alive[0] : null;
        var wp = match.game.winner ? (match.players || []).find(function(p) { return p.seat === match.game.winner; }) : null;
        match.log.push({ t: Date.now(), type: "GAME_OVER", winner: match.game.winner, winnerName: wp ? wp.username : null });
    }
}

function engineCardMeta(match, seat, cardId) {
    var meta = match.decks?.[seat]?.cardMeta || {};
    return meta[cardId] || meta[baseCardId(cardId)] || null;
}
function engineBotCardMeta(match, seat, cardId) {
    return engineCardMeta(match, seat, cardId) || {};
}

function engineBotIsLand(match, seat, cardId) {
    const tl = String(engineBotCardMeta(match, seat, cardId).typeLine || "").toLowerCase();
    return tl.includes("land");
}

function engineCardType(match, seat, cardId) {
    const tl = String(engineCardMeta(match, seat, cardId)?.typeLine || "").toLowerCase();
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

function engineParseSpellEffects(oracleText) {
    if (!oracleText) return [];
    var effects = [];
    var text = oracleText.toLowerCase();
    // "deals N damage to ..."
    var dmgRe = /deals\s+(\d+)\s+damage\s+to\s+(any target|target creature|target player|target opponent|each opponent)/gi;
    var dm;
    while ((dm = dmgRe.exec(oracleText)) !== null) {
        var tType = dm[2].toLowerCase();
        if (tType === 'target opponent') tType = 'target player';
        effects.push({ type: 'damage', amount: parseInt(dm[1], 10), targetType: tType });
    }
    // "destroy target creature/permanent" + compound forms like "destroy target enchantment, or creature with flying"
    var destRe = /destroy\s+target\s+(creature|permanent|enchantment|artifact|nonland permanent)/gi;
    var de;
    while ((de = destRe.exec(oracleText)) !== null) {
        effects.push({ type: 'destroy', targetType: de[1].toLowerCase() });
    }
    // Compound destroy: "destroy target X, or Y" / "destroy target X or Y"
    if (!effects.some(function(e) { return e.type === 'destroy'; })) {
        var compDestRe = /destroy\s+target\s+[\w\s]+(?:,\s*or\s+|\s+or\s+)(?:creature|permanent|enchantment|artifact)/gi;
        if (compDestRe.test(oracleText)) {
            // Check if the oracle text mentions creature as a valid target
            var destOracleLc = oracleText.toLowerCase();
            if (/destroy\s+target\s+[\w\s,]*creature/i.test(destOracleLc) || /or\s+creature/i.test(destOracleLc)) {
                effects.push({ type: 'destroy', targetType: 'creature' });
            } else {
                effects.push({ type: 'destroy', targetType: 'permanent' });
            }
        }
    }
    // "exile target creature/permanent"
    var exileRe = /exile\s+target\s+(creature|permanent|nonland permanent)/gi;
    var ex;
    while ((ex = exileRe.exec(oracleText)) !== null) {
        effects.push({ type: 'exile', targetType: ex[1].toLowerCase() });
    }
    // "return target creature/permanent to its owner's hand"
    var bounceRe = /return\s+target\s+(creature|permanent)\s+to\s+its\s+owner'?s\s+hand/gi;
    var bo;
    while ((bo = bounceRe.exec(oracleText)) !== null) {
        effects.push({ type: 'bounce', targetType: bo[1].toLowerCase() });
    }
    // "draw N card(s)"
    var drawRe = /draw\s+(\w+)\s+cards?/gi;
    var dr;
    var wordToNum = { a: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7 };
    while ((dr = drawRe.exec(oracleText)) !== null) {
        var n = parseInt(dr[1], 10);
        if (isNaN(n)) n = wordToNum[dr[1].toLowerCase()] || 1;
        effects.push({ type: 'draw', amount: n });
    }
    // "gain N life"
    var lifeRe = /gain\s+(\d+)\s+life/gi;
    var lr;
    while ((lr = lifeRe.exec(oracleText)) !== null) {
        effects.push({ type: 'gainLife', amount: parseInt(lr[1], 10) });
    }
    // "target creature gets +N/+N until end of turn"
    var buffRe = /target\s+creature\s+gets\s+([+-]\d+)\/([+-]\d+)[\s\S]*?until\s+end\s+of\s+turn/gi;
    var br;
    while ((br = buffRe.exec(oracleText)) !== null) {
        effects.push({ type: 'tempBuff', power: parseInt(br[1], 10), toughness: parseInt(br[2], 10) });
    }
    // "gains [keyword] until end of turn"
    var kwGrantRe = /(?:and\s+)?gains?\s+(flying|reach|first strike|double strike|trample|deathtouch|lifelink|haste|vigilance|defender|menace|indestructible|hexproof)\s+until\s+end\s+of\s+turn/gi;
    var kr;
    while ((kr = kwGrantRe.exec(oracleText)) !== null) {
        effects.push({ type: 'tempKeyword', keyword: kr[1] });
    }
    // "Create a/N Treasure token(s)"
    var treasureRe = /create\s+(?:a|(\d+))\s+treasure\s+tokens?/gi;
    var tr;
    while ((tr = treasureRe.exec(oracleText)) !== null) {
        effects.push({ type: 'createToken', tokenType: 'treasure', count: tr[1] ? parseInt(tr[1], 10) : 1 });
    }
    // "Create a/N P/T [type] creature token(s)"
    var creatureTokenRe = /create\s+(?:a|(\d+))\s+(\d+)\/(\d+)\s+[\w\s]*?([\w]+)\s+creature\s+tokens?(?:\s+with\s+([\w\s]+))?/gi;
    var ctr;
    while ((ctr = creatureTokenRe.exec(oracleText)) !== null) {
        effects.push({ type: 'createToken', tokenType: 'creature', count: ctr[1] ? parseInt(ctr[1], 10) : 1, power: parseInt(ctr[2], 10), toughness: parseInt(ctr[3], 10), subtype: ctr[4], keywords: ctr[5] ? ctr[5].split(/\s+and\s+|\s*,\s*/) : [] });
    }
    // "mill N cards" / "put the top N cards of your library into your graveyard"
    var millRe = /mill\s+(\w+)\s+cards?/gi;
    var ml;
    while ((ml = millRe.exec(oracleText)) !== null) {
        var mNum = parseInt(ml[1], 10);
        if (isNaN(mNum)) mNum = wordToNum[ml[1].toLowerCase()] || 1;
        effects.push({ type: 'mill', amount: mNum, target: 'self' });
    }
    var millAltRe = /put the top\s+(\w+)\s+cards?\s+of\s+(?:your|their)\s+library\s+into\s+(?:your|their)\s+graveyard/gi;
    var mla;
    while ((mla = millAltRe.exec(oracleText)) !== null) {
        var maNum = parseInt(mla[1], 10);
        if (isNaN(maNum)) maNum = wordToNum[mla[1].toLowerCase()] || 1;
        if (!effects.some(function(e) { return e.type === 'mill'; })) {
            effects.push({ type: 'mill', amount: maNum, target: 'self' });
        }
    }
    // "Destroy all artifacts/enchantments/creatures"
    var destroyAllRe = /destroy\s+all\s+(artifacts?|enchantments?|creatures?|nonland permanents?|permanents?)/gi;
    var da;
    while ((da = destroyAllRe.exec(oracleText)) !== null) {
        effects.push({ type: 'destroyAll', targetType: da[1].toLowerCase().replace(/s$/, '') });
    }
    // "put all creatures with mana value N or less/greater into graveyard"
    var putAllGyRe = /put\s+all\s+(creatures?)\s+with\s+mana\s+value\s+(\d+)\s+or\s+(less|greater)\s+into/gi;
    var pag;
    while ((pag = putAllGyRe.exec(oracleText)) !== null) {
        effects.push({ type: 'destroyAll', targetType: 'creature', cmcFilter: { value: parseInt(pag[2], 10), direction: pag[3].toLowerCase() } });
    }
    // "Scry N"
    var scryRe = /scry\s+(\d+)/gi;
    var scm;
    while ((scm = scryRe.exec(oracleText)) !== null) {
        effects.push({ type: 'scry', amount: parseInt(scm[1], 10) });
    }
    return effects;
}

function engineParseModalModes(oracleText) {
    if (!oracleText) return null;
    var chooseRe = /choose\s+(one|two|three|four|one\s+or\s+both|one\s+or\s+more)\s*(?:\u2014|-)/i;
    var chooseMatch = chooseRe.exec(oracleText);
    if (!chooseMatch) return null;
    var choiceWord = chooseMatch[1].toLowerCase().replace(/\s+/g, ' ');
    var wordToNum2 = { one: 1, two: 2, three: 3, four: 4 };
    var minChoices, maxChoices;
    if (choiceWord === 'one or both') { minChoices = 1; maxChoices = 2; }
    else if (choiceWord === 'one or more') { minChoices = 1; maxChoices = 99; }
    else { minChoices = wordToNum2[choiceWord] || 1; maxChoices = minChoices; }
    var bulletParts = oracleText.split('\u2022');
    var modes = [];
    for (var i = 1; i < bulletParts.length; i++) {
        var mText = bulletParts[i].trim();
        if (!mText) continue;
        var mEffects = engineParseSpellEffects(mText);
        modes.push({ text: mText, effects: mEffects });
    }
    if (modes.length < 2) return null;
    return { minChoices: minChoices, maxChoices: Math.min(maxChoices, modes.length), modes: modes };
}

function engineEffectNeedsTarget(effects) {
    for (var i = 0; i < effects.length; i++) {
        var e = effects[i];
        if (e.type === 'damage' && (e.targetType === 'target creature' || e.targetType === 'target player' || e.targetType === 'any target')) return true;
        if (e.type === 'destroy') return true;
        if (e.type === 'exile') return true;
        if (e.type === 'bounce') return true;
        if (e.type === 'tempBuff') return true;
        if (e.type === 'tempKeyword') return true;
    }
    return false;
}

function engineMatchesTypeFilter(match, seat, cardId, filterType) {
    // Check typeLine directly — multi-type cards (Artifact Creature, Enchantment Creature) match all their types
    var tl = String(engineCardMeta(match, seat, cardId)?.typeLine || "").toLowerCase();
    if (filterType === 'creature') return tl.includes('creature');
    if (filterType === 'artifact') return tl.includes('artifact');
    if (filterType === 'enchantment') return tl.includes('enchantment');
    if (filterType === 'permanent') return true;
    if (filterType === 'nonland permanent') return !tl.includes('land') || tl.includes('creature') || tl.includes('artifact') || tl.includes('enchantment');
    return tl.includes(filterType);
}

function engineApplyMassEffect(match, casterSeat, effect) {
    var seats = engineSeatOrder(match);
    var destroyed = 0;
    for (var si = 0; si < seats.length; si++) {
        var s = seats[si];
        engineEnsureZones(match, s);
        var bf = match.game.zones[s].battlefield.slice(); // copy — we'll mutate
        for (var ci = 0; ci < bf.length; ci++) {
            var cid = bf[ci];
            if (!engineMatchesTypeFilter(match, s, cid, effect.targetType)) continue;
            // CMC filter (e.g., "mana value 3 or less")
            if (effect.cmcFilter) {
                var cardCmc = Number(engineCardMeta(match, s, cid)?.cmc) || 0;
                if (effect.cmcFilter.direction === 'less' && cardCmc > effect.cmcFilter.value) continue;
                if (effect.cmcFilter.direction === 'greater' && cardCmc < effect.cmcFilter.value) continue;
            }
            // Indestructible check
            if (engineHasKeyword(match, s, cid, "Indestructible")) {
                match.log.push({ t: Date.now(), type: "MASS_BLOCKED", target: cid, reason: "Indestructible" });
                continue;
            }
            var moveOk = engineMoveCard(match, s, "battlefield", "graveyard", cid);
            if (moveOk.ok) destroyed++;
        }
    }
    match.log.push({ t: Date.now(), type: "MASS_DESTROY", by: casterSeat, targetType: effect.targetType, count: destroyed });
    return destroyed;
}

function engineApplyEffect(match, casterSeat, effect, targetId) {
    if (effect.type === 'destroyAll') {
        return engineApplyMassEffect(match, casterSeat, effect);
    }
    if (effect.type === 'damage') {
        if (effect.targetType === 'each opponent') {
            var seats = engineSeatOrder(match);
            for (var i = 0; i < seats.length; i++) {
                if (seats[i] !== casterSeat) {
                    if (match.game.lifeBySeat[seats[i]] != null) {
                        match.game.lifeBySeat[seats[i]] = Math.max(0, match.game.lifeBySeat[seats[i]] - effect.amount);
                        match.log.push({ t: Date.now(), type: "SPELL_DAMAGE", seat: seats[i], damage: effect.amount });
                    }
                }
            }
        } else if (targetId && typeof targetId === 'string' && targetId.indexOf('seat:') === 0) {
            // Player target
            var tSeat = Number(targetId.replace('seat:', ''));
            if (match.game.lifeBySeat[tSeat] != null) {
                match.game.lifeBySeat[tSeat] = Math.max(0, match.game.lifeBySeat[tSeat] - effect.amount);
                match.log.push({ t: Date.now(), type: "SPELL_DAMAGE", seat: tSeat, damage: effect.amount });
            }
        } else if (targetId) {
            // Creature target
            var tSeat2 = engineFindSeatForCard(match, targetId);
            if (tSeat2 != null) {
                engineEnsureCardState(match, targetId);
                match.game.cardState[targetId].damage = (Number(match.game.cardState[targetId].damage) || 0) + effect.amount;
                match.game.cardState[targetId].damageSourceIds.push('spell');
                match.log.push({ t: Date.now(), type: "SPELL_DAMAGE_CREATURE", target: targetId, damage: effect.amount });
            }
        }
    } else if (effect.type === 'destroy') {
        if (targetId) {
            var dSeat = engineFindSeatForCard(match, targetId);
            if (dSeat != null) {
                if (engineHasKeyword(match, dSeat, targetId, "Indestructible")) {
                    match.log.push({ t: Date.now(), type: "SPELL_BLOCKED", target: targetId, reason: "Indestructible" });
                } else {
                    engineMoveCard(match, dSeat, "battlefield", "graveyard", targetId);
                    match.log.push({ t: Date.now(), type: "SPELL_DESTROY", target: targetId });
                }
            }
        }
    } else if (effect.type === 'draw') {
        var drawRes = engineDrawCards(match, casterSeat, effect.amount);
        match.log.push({ t: Date.now(), type: "SPELL_DRAW", seat: casterSeat, amount: effect.amount });
        if (drawRes.deckOut) {
            if (!match.game.losers) match.game.losers = [];
            if (match.game.losers.indexOf(casterSeat) < 0) {
                match.game.losers.push(casterSeat);
                if (!match.game.loserReasons) match.game.loserReasons = {}; match.game.loserReasons[casterSeat] = 'deck_out';
                match.log.push({ t: Date.now(), type: "DECK_OUT", seat: casterSeat });
                engineCheckGameOver(match);
            }
        }
    } else if (effect.type === 'gainLife') {
        if (match.game.lifeBySeat[casterSeat] != null) {
            match.game.lifeBySeat[casterSeat] += effect.amount;
            match.log.push({ t: Date.now(), type: "SPELL_GAIN_LIFE", seat: casterSeat, amount: effect.amount });
        }
    } else if (effect.type === 'tempBuff') {
        if (targetId) {
            if (!match.game.tempBuffs) match.game.tempBuffs = [];
            match.game.tempBuffs.push({ cardId: targetId, power: effect.power, toughness: effect.toughness });
            match.log.push({ t: Date.now(), type: "SPELL_BUFF", target: targetId, power: effect.power, toughness: effect.toughness });
            // Check if debuff killed the creature (toughness reduced to 0 or less)
            if (effect.toughness < 0) engineCheckLethalDamage(match);
        }
    } else if (effect.type === 'tempKeyword') {
        if (targetId) {
            if (!match.game.tempKeywords) match.game.tempKeywords = [];
            var kwName = String(effect.keyword || '').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
            match.game.tempKeywords.push({ cardId: targetId, keyword: kwName });
            match.log.push({ t: Date.now(), type: "SPELL_KEYWORD", target: targetId, keyword: kwName });
        }
    } else if (effect.type === 'createToken') {
        var tokenCount = effect.count || 1;
        for (var tci = 0; tci < tokenCount; tci++) {
            if (effect.tokenType === 'treasure') {
                engineCreateToken(match, casterSeat, {
                    name: 'Treasure', typeLine: 'Token Artifact \u2014 Treasure',
                    oracleText: '{T}, Sacrifice this artifact: Add one mana of any color.',
                });
            } else if (effect.tokenType === 'creature') {
                engineCreateToken(match, casterSeat, {
                    name: (effect.subtype || 'Creature') + ' Token',
                    typeLine: 'Token Creature \u2014 ' + (effect.subtype || 'Creature'),
                    power: effect.power || 1, toughness: effect.toughness || 1,
                    keywords: (effect.keywords || []).map(function(k) { return k.trim().replace(/\b\w/g, function(c2) { return c2.toUpperCase(); }); }),
                });
            }
        }
    } else if (effect.type === 'exile') {
        if (targetId) {
            var exSeat = engineFindSeatForCard(match, targetId);
            if (exSeat != null) {
                engineMoveCard(match, exSeat, "battlefield", "exile", targetId);
                match.log.push({ t: Date.now(), type: "SPELL_EXILE", target: targetId });
            }
        }
    } else if (effect.type === 'bounce') {
        if (targetId) {
            var boSeat = engineFindSeatForCard(match, targetId);
            if (boSeat != null) {
                engineMoveCard(match, boSeat, "battlefield", "hand", targetId);
                match.log.push({ t: Date.now(), type: "SPELL_BOUNCE", target: targetId });
            }
        }
    } else if (effect.type === 'mill') {
        var millSeat = (effect.target === 'self') ? casterSeat : (targetId ? Number(String(targetId).replace('seat:', '')) : casterSeat);
        engineEnsureZones(match, millSeat);
        var lib = match.game.zones[millSeat].library;
        var gy = match.game.zones[millSeat].graveyard;
        if (!Array.isArray(lib)) lib = [];
        if (!Array.isArray(gy)) { gy = []; match.game.zones[millSeat].graveyard = gy; }
        var millCount = Math.min(effect.amount, lib.length);
        var milledCards = lib.splice(0, millCount);
        for (var mci = 0; mci < milledCards.length; mci++) { gy.push(milledCards[mci]); }
        match.log.push({ t: Date.now(), type: "MILL", seat: millSeat, amount: millCount, cardIds: milledCards });
    } else if (effect.type === 'scry') {
        engineEnsureZones(match, casterSeat);
        var scryLib = match.game.zones[casterSeat].library;
        var scryN = Math.min(effect.amount, scryLib.length);
        if (scryN > 0) {
            var scryCards = scryLib.slice(0, scryN);
            match.game.scryPending = { seat: casterSeat, count: scryN, cardIds: scryCards };
            match.log.push({ t: Date.now(), type: "SCRY", seat: casterSeat, count: scryN });
        }
    }
}

function engineActivateAbility(match, seat, cardId, oracleText) {
    // Class enchantment: level up
    var typeLine = String(engineCardMeta(match, seat, cardId)?.typeLine || '');
    if (/class/i.test(typeLine)) {
        if (!match.game.cardState) match.game.cardState = {};
        if (!match.game.cardState[cardId]) match.game.cardState[cardId] = {};
        var currentLevel = match.game.cardState[cardId].classLevel || 1;
        if (currentLevel >= 3) return { ok: false, error: "Already at max level" };
        var nextLevel = currentLevel + 1;
        var levelPattern = /((?:\{[^}]+\})+)\s*:\s*Level\s+(\d+)/gi;
        var levelMatch; var nextCost = null;
        while ((levelMatch = levelPattern.exec(oracleText)) !== null) {
            if (parseInt(levelMatch[2]) === nextLevel) { nextCost = levelMatch[1]; break; }
        }
        if (!nextCost) return { ok: false, error: "No level " + nextLevel + " ability found" };
        // Parse total mana cost from symbols like {2}{R}
        var totalMana = 0;
        var costSymbols = nextCost.match(/\{[^}]+\}/g) || [];
        for (var ci = 0; ci < costSymbols.length; ci++) {
            var sym = costSymbols[ci].replace(/[{}]/g, '');
            var numVal = parseInt(sym);
            if (!isNaN(numVal)) { totalMana += numVal; }
            else { totalMana += 1; } // Colored mana symbol costs 1 from generic pool
        }
        if (!match.game.manaBySeat) match.game.manaBySeat = {};
        if (!match.game.manaBySeat[seat]) match.game.manaBySeat[seat] = { current: 0, max: 0 };
        if (match.game.manaBySeat[seat].current < totalMana) {
            return { ok: false, error: "Not enough mana (" + totalMana + " needed, have " + match.game.manaBySeat[seat].current + ")" };
        }
        match.game.manaBySeat[seat].current -= totalMana;
        match.game.cardState[cardId].classLevel = nextLevel;
        return { ok: true, ability: 'class_level_up', newLevel: nextLevel };
    }
    // Treasure: "Sacrifice this artifact: Add one mana"
    if (/sacrifice\s+this\s+artifact.*add\s+one\s+mana/i.test(oracleText)) {
        engineMoveCard(match, seat, "battlefield", "graveyard", cardId);
        if (!match.game.manaBySeat) match.game.manaBySeat = {};
        if (!match.game.manaBySeat[seat]) match.game.manaBySeat[seat] = { current: 0, max: 0 };
        match.game.manaBySeat[seat].current += 1;
        return { ok: true, ability: 'sacrifice_for_mana' };
    }
    // Scry / look at top N
    var scryMatch = /scry\s+(\d+)/i.exec(oracleText);
    var lookTopMatch = /look\s+at\s+the\s+top\s+(\w+)\s+cards?\s+of\s+your\s+library/i.exec(oracleText);
    var scryCount = 0;
    if (scryMatch) scryCount = parseInt(scryMatch[1], 10);
    else if (lookTopMatch) {
        var wtn = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7 };
        scryCount = parseInt(lookTopMatch[1], 10);
        if (isNaN(scryCount)) scryCount = wtn[lookTopMatch[1].toLowerCase()] || 1;
    }
    if (scryCount > 0) {
        engineEnsureZones(match, seat);
        var lib = match.game.zones[seat].library;
        var topCards = lib.slice(0, Math.min(scryCount, lib.length));
        if (!topCards.length) return { ok: false, error: "library is empty" };
        match.game.scryPending = { seat: seat, count: scryCount, cardIds: topCards };
        return { ok: true, ability: 'scry', scryCount: scryCount, cardIds: topCards };
    }
    return { ok: false, error: "no recognized activated ability" };
}

function enginePlayCard(match, seat, cardId, targetId, selectedModes) {
    if (engineIsSpell(match, seat, cardId)) {
        var moveRes = engineMoveCard(match, seat, "hand", "graveyard", cardId);
        if (moveRes.ok) {
            var meta = engineCardMeta(match, seat, cardId);
            var oracleText = meta?.oracleText;
            var effectsToApply = [];
            // Modal spell: only apply selected modes' effects
            if (selectedModes && Array.isArray(selectedModes) && selectedModes.length > 0) {
                var modalInfo = engineParseModalModes(oracleText);
                if (modalInfo) {
                    for (var mi = 0; mi < selectedModes.length; mi++) {
                        var modeIdx = selectedModes[mi];
                        if (modeIdx >= 0 && modeIdx < modalInfo.modes.length) {
                            var modeEffects = modalInfo.modes[modeIdx].effects;
                            for (var mei = 0; mei < modeEffects.length; mei++) effectsToApply.push(modeEffects[mei]);
                        }
                    }
                    match.log.push({ t: Date.now(), type: "MODAL_CAST", seat: seat, cardId: cardId, modes: selectedModes });
                }
            }
            // Non-modal: apply all effects
            if (!effectsToApply.length && (!selectedModes || !selectedModes.length)) {
                effectsToApply = engineParseSpellEffects(oracleText);
            }
            for (var ei = 0; ei < effectsToApply.length; ei++) {
                engineApplyEffect(match, seat, effectsToApply[ei], targetId);
            }
            if (effectsToApply.length) {
                engineCheckLethalDamage(match);
                engineCheckGameOver(match);
            }
        }
        return moveRes;
    }
    var result = engineMoveCard(match, seat, "hand", "battlefield", cardId);
    if (result.ok && engineIsCreature(match, seat, cardId)) {
        if (!match.game.cardState) match.game.cardState = {};
        var hasHaste = engineHasKeyword(match, seat, cardId, "Haste");
        match.game.cardState[cardId] = { tapped: false, summoningSick: !hasHaste, damage: 0, damageSourceIds: [] };
    }
    if (result.ok && engineIsAura(match, seat, cardId)) {
        if (!targetId) return { ok: false, error: "aura requires a target creature" };
        if (!match.game.auraAttachments) match.game.auraAttachments = {};
        match.game.auraAttachments[cardId] = targetId;
    }
    // ETB (enters-the-battlefield) triggers
    if (result.ok) {
        var etbMeta = engineCardMeta(match, seat, cardId);
        var etbOracle = String(etbMeta?.oracleText || '');
        // Detect ETB text: "When ~ enters the battlefield" / "When ~ enters," / "When this creature enters,"
        var hasEtb = /when\s+(?:this\s+creature|[\w,\s]+)\s+enters/i.test(etbOracle);
        if (hasEtb) {
            var etbEffects = engineParseSpellEffects(etbOracle);
            if (etbEffects.length) {
                for (var etbi = 0; etbi < etbEffects.length; etbi++) {
                    engineApplyEffect(match, seat, etbEffects[etbi], targetId);
                }
                match.log.push({ t: Date.now(), type: "ETB_TRIGGER", seat: seat, cardId: cardId, effectCount: etbEffects.length });
                engineCheckLethalDamage(match);
                engineCheckGameOver(match);
            }
        }
    }
    return result;
}

function engineBotCardImpactScore(match, seat, cardId) {
    var meta = engineBotCardMeta(match, seat, cardId);
    var oracle = String(meta?.oracleText || '');
    var type = engineCardType(match, seat, cardId);
    var score = 0;
    var cmc = Number(meta?.cmc) || 0;
    // Removal spells (destroy/exile/damage) — highest priority
    if ((type === 'instant' || type === 'sorcery') && /destroy|exile|deals?\s+\d+\s+damage/i.test(oracle)) {
        score += 100;
        // Extra value for board sweeps ("destroy all")
        if (/destroy\s+all/i.test(oracle)) score += 50;
        // Extra value if opponents have permanents to remove
        var allSeats = engineSeatOrder(match);
        var hasTargets = false;
        for (var si = 0; si < allSeats.length; si++) {
            if (allSeats[si] === seat) continue;
            var oBf = match.game.zones?.[allSeats[si]]?.battlefield || [];
            if (oBf.length > 0) hasTargets = true;
            if (hasTargets) break;
        }
        if (hasTargets) score += 30;
    }
    // Draw spells — high value (card advantage)
    if ((type === 'instant' || type === 'sorcery') && /draw/i.test(oracle)) score += 80;
    // Creatures — score by stats and keywords
    if (type === 'creature') {
        var pw = Number(meta?.power) || 0;
        var tw = Number(meta?.toughness) || 0;
        score += pw * 8 + tw * 4;
        // Keyword bonuses
        var kwBonus = 0;
        if (/flying/i.test(oracle)) kwBonus += 15;
        if (/trample/i.test(oracle)) kwBonus += 10;
        if (/deathtouch/i.test(oracle)) kwBonus += 15;
        if (/lifelink/i.test(oracle)) kwBonus += 10;
        if (/first strike|double strike/i.test(oracle)) kwBonus += 12;
        if (/haste/i.test(oracle)) kwBonus += 8;
        if (/menace/i.test(oracle)) kwBonus += 10;
        if (/indestructible/i.test(oracle)) kwBonus += 18;
        if (/vigilance/i.test(oracle)) kwBonus += 6;
        score += kwBonus;
    }
    // Auras — buff vs debuff awareness
    if (engineIsAura(match, seat, cardId)) {
        var auraMods = engineParseAuraMods(match, seat, cardId);
        var auraOr = String(meta?.oracleText || '');
        var auraIsDebuff = (auraMods.power < 0 || auraMods.toughness < 0) || /can't attack|can't block|doesn't untap|gets\s*-/i.test(auraOr);
        if (auraIsDebuff) {
            // Debuff aura — valuable if opponents have creatures
            var hasOppCr = false;
            var auraSeats = engineSeatOrder(match);
            for (var asi = 0; asi < auraSeats.length; asi++) {
                if (auraSeats[asi] === seat) continue;
                var aoBf = match.game.zones?.[auraSeats[asi]]?.battlefield || [];
                if (aoBf.some(function(id) { return engineIsCreature(match, auraSeats[asi], id); })) { hasOppCr = true; break; }
            }
            score += hasOppCr ? 70 : 5;
        } else {
            // Buff aura — valuable if we have creatures
            var hasCr = (match.game.zones?.[seat]?.battlefield || []).some(function(id) { return engineIsCreature(match, seat, id); });
            score += hasCr ? 60 : 5;
        }
    }
    // Enchantments/artifacts (non-aura) — moderate value
    if ((type === 'enchantment' || type === 'artifact') && !engineIsAura(match, seat, cardId)) score += 40;
    // CMC efficiency tiebreaker — prefer mana-efficient cards
    score += Math.max(0, 12 - cmc * 2);
    return score;
}

function engineBotTakeTurn(match, botPlayer) {
    if (match.game?.status === "finished") return;
    // If waiting for a human to declare blockers, don't continue the bot's turn
    if (match.game.step === "combat_blockers") return;
    const seat = botPlayer.seat; const diff = botDifficultyNormalize(botPlayer.difficulty);
    engineEnsureZones(match, seat);
    const hand = Array.isArray(match.game.zones[seat].hand) ? match.game.zones[seat].hand : [];
    const bf = Array.isArray(match.game.zones[seat].battlefield) ? match.game.zones[seat].battlefield : [];
    const played = [];
    if (!match.game.manaBySeat) match.game.manaBySeat = {};
    const mana = match.game.manaBySeat[seat] || { current: 0, max: 0 };
    match.game.manaBySeat[seat] = mana;

    const getCmc = (id) => Number(engineBotCardMeta(match, seat, id).cmc) || 0;

    // Bot uses Treasures for extra mana if needed
    var treasuresOnBf = bf.filter(function(id) {
        var m = engineCardMeta(match, seat, id);
        return m && /sacrifice.*add.*mana/i.test(m.oracleText || '');
    });
    var nonLandHand = hand.filter(function(id) { return engineCardType(match, seat, id) !== "land"; });
    var cheapestInHand = nonLandHand.length ? Math.min.apply(null, nonLandHand.map(getCmc)) : 999;
    while (treasuresOnBf.length && mana.current < cheapestInHand) {
        var tid = treasuresOnBf.shift();
        engineActivateAbility(match, seat, tid, String(engineCardMeta(match, seat, tid)?.oracleText || ''));
        match.log.push({ t: Date.now(), type: "ACTIVATE", by: "bot", seat: seat, cardId: tid, ability: 'sacrifice_for_mana' });
    }

    const affordable = hand.filter(id => getCmc(id) <= mana.current);

    var skipCardPlay = !affordable.length || (diff === "easy" && sup.random.integer(0, 6) < 1);
    if (skipCardPlay) {
        match.log.push({ t: Date.now(), type: "BOT_PASS", by: "bot", seat, difficulty: diff });
    }

    if (!skipCardPlay) {
    // Helper: find best aura target for bot (detects buff vs debuff)
    var botAuraTarget = function(cardId) {
        var allSeats = engineSeatOrder(match);
        var auraMeta = engineBotCardMeta(match, seat, cardId);
        var auraOracle = String(auraMeta?.oracleText || '');
        var mods = engineParseAuraMods(match, seat, cardId);
        var isDebuff = (mods.power < 0 || mods.toughness < 0) || /can't attack|can't block|doesn't untap|gets\s*-/i.test(auraOracle);
        if (isDebuff) {
            // Target opponent's strongest creature
            var bestTarget = null; var bestPow = -1;
            for (var si = 0; si < allSeats.length; si++) {
                if (allSeats[si] === seat) continue;
                var oBf = match.game.zones?.[allSeats[si]]?.battlefield || [];
                for (var ci = 0; ci < oBf.length; ci++) {
                    if (!engineIsCreature(match, allSeats[si], oBf[ci])) continue;
                    if (engineHasKeyword(match, allSeats[si], oBf[ci], "Hexproof")) continue;
                    var p = engineGetCreaturePower(match, allSeats[si], oBf[ci]);
                    if (p > bestPow) { bestPow = p; bestTarget = oBf[ci]; }
                }
            }
            return bestTarget;
        }
        // Buff aura — target own strongest creature
        var bestBuff = null; var bestBp = -1;
        var ownBf = match.game.zones?.[seat]?.battlefield || [];
        for (var oi = 0; oi < ownBf.length; oi++) {
            if (!engineIsCreature(match, seat, ownBf[oi])) continue;
            var pw = engineGetCreaturePower(match, seat, ownBf[oi]);
            if (pw > bestBp) { bestBp = pw; bestBuff = ownBf[oi]; }
        }
        return bestBuff;
    };

    var botPickSpellTarget = function(cardId) {
        var meta = engineBotCardMeta(match, seat, cardId);
        var effects = engineParseSpellEffects(meta?.oracleText);
        if (!engineEffectNeedsTarget(effects)) return null; // no target needed
        var allSeats = engineSeatOrder(match);
        for (var ei = 0; ei < effects.length; ei++) {
            var eff = effects[ei];
            if (eff.type === 'damage' && (eff.targetType === 'target creature' || eff.targetType === 'any target')) {
                // Pick weakest opponent creature that would die from this damage
                var bestTarget = null; var bestTough = 999;
                for (var si = 0; si < allSeats.length; si++) {
                    if (allSeats[si] === seat) continue;
                    var oBf = match.game.zones?.[allSeats[si]]?.battlefield || [];
                    for (var ci = 0; ci < oBf.length; ci++) {
                        if (!engineIsCreature(match, allSeats[si], oBf[ci])) continue;
                        if (engineHasKeyword(match, allSeats[si], oBf[ci], "Hexproof")) continue;
                        var t = engineGetCreatureToughness(match, allSeats[si], oBf[ci]);
                        var existDmg = Number(match.game.cardState?.[oBf[ci]]?.damage) || 0;
                        if (eff.amount + existDmg >= t && t < bestTough) { bestTarget = oBf[ci]; bestTough = t; }
                    }
                }
                if (bestTarget) return bestTarget;
                if (eff.targetType === 'any target') { var wkSeat = enginePickWeakestOpponent(match, seat); return wkSeat != null ? 'seat:' + wkSeat : null; }
            }
            if (eff.type === 'damage' && eff.targetType === 'target player') {
                var wkSeat2 = enginePickWeakestOpponent(match, seat); return wkSeat2 != null ? 'seat:' + wkSeat2 : null;
            }
            if (eff.type === 'destroy') {
                // Pick best opponent permanent matching targetType
                var destType = eff.targetType || 'creature';
                var bestDest = null; var bestPow = -1;
                for (var si2 = 0; si2 < allSeats.length; si2++) {
                    if (allSeats[si2] === seat) continue;
                    var oBf2 = match.game.zones?.[allSeats[si2]]?.battlefield || [];
                    for (var ci2 = 0; ci2 < oBf2.length; ci2++) {
                        if (!engineMatchesTypeFilter(match, allSeats[si2], oBf2[ci2], destType)) continue;
                        if (engineHasKeyword(match, allSeats[si2], oBf2[ci2], "Hexproof")) continue;
                        if (engineHasKeyword(match, allSeats[si2], oBf2[ci2], "Indestructible")) continue;
                        // Score: creatures by power, non-creatures by CMC
                        var p = engineIsCreature(match, allSeats[si2], oBf2[ci2]) ? engineGetCreaturePower(match, allSeats[si2], oBf2[ci2]) : (Number(engineCardMeta(match, allSeats[si2], oBf2[ci2])?.cmc) || 1);
                        if (p > bestPow) { bestPow = p; bestDest = oBf2[ci2]; }
                    }
                }
                return bestDest;
            }
            if (eff.type === 'exile' || eff.type === 'bounce') {
                // Pick best opponent permanent (no Indestructible check — exile/bounce bypass it)
                var remType = eff.targetType || 'creature';
                var bestRemoval = null; var bestRp = -1;
                for (var si3 = 0; si3 < allSeats.length; si3++) {
                    if (allSeats[si3] === seat) continue;
                    var oBf3 = match.game.zones?.[allSeats[si3]]?.battlefield || [];
                    for (var ci3 = 0; ci3 < oBf3.length; ci3++) {
                        if (!engineMatchesTypeFilter(match, allSeats[si3], oBf3[ci3], remType)) continue;
                        if (engineHasKeyword(match, allSeats[si3], oBf3[ci3], "Hexproof")) continue;
                        var rp = engineIsCreature(match, allSeats[si3], oBf3[ci3]) ? engineGetCreaturePower(match, allSeats[si3], oBf3[ci3]) : (Number(engineCardMeta(match, allSeats[si3], oBf3[ci3])?.cmc) || 1);
                        if (rp > bestRp) { bestRp = rp; bestRemoval = oBf3[ci3]; }
                    }
                }
                return bestRemoval;
            }
            if (eff.type === 'tempBuff') {
                // Pick own strongest creature
                var ownBf = match.game.zones?.[seat]?.battlefield || [];
                var bestBuff = null; var bestBp = -1;
                for (var bi = 0; bi < ownBf.length; bi++) {
                    if (!engineIsCreature(match, seat, ownBf[bi])) continue;
                    var bp = engineGetCreaturePower(match, seat, ownBf[bi]);
                    if (bp > bestBp) { bestBp = bp; bestBuff = ownBf[bi]; }
                }
                return bestBuff;
            }
            if (eff.type === 'tempKeyword') {
                var ownBf2 = match.game.zones?.[seat]?.battlefield || [];
                var bestKw = null; var bestKp = -1;
                for (var ki = 0; ki < ownBf2.length; ki++) {
                    if (!engineIsCreature(match, seat, ownBf2[ki])) continue;
                    var kp = engineGetCreaturePower(match, seat, ownBf2[ki]);
                    if (kp > bestKp) { bestKp = kp; bestKw = ownBf2[ki]; }
                }
                return bestKw;
            }
        }
        return null;
    };

    var botSelectModes = function(cardId) {
        var meta = engineBotCardMeta(match, seat, cardId);
        var modalInfo = engineParseModalModes(meta?.oracleText);
        if (!modalInfo) return null;
        // Score each mode by board impact
        var modeScores = [];
        var allSeats = engineSeatOrder(match);
        for (var mi = 0; mi < modalInfo.modes.length; mi++) {
            var score = 0;
            var mode = modalInfo.modes[mi];
            for (var ei = 0; ei < mode.effects.length; ei++) {
                var eff = mode.effects[ei];
                if (eff.type === 'destroyAll') {
                    // Count how many opponent permanents this would destroy
                    for (var si = 0; si < allSeats.length; si++) {
                        if (allSeats[si] === seat) continue;
                        var oBf = match.game.zones?.[allSeats[si]]?.battlefield || [];
                        for (var ci = 0; ci < oBf.length; ci++) {
                            if (engineMatchesTypeFilter(match, allSeats[si], oBf[ci], eff.targetType)) {
                                if (eff.cmcFilter) {
                                    var cc = Number(engineCardMeta(match, allSeats[si], oBf[ci])?.cmc) || 0;
                                    if (eff.cmcFilter.direction === 'less' && cc > eff.cmcFilter.value) continue;
                                    if (eff.cmcFilter.direction === 'greater' && cc < eff.cmcFilter.value) continue;
                                }
                                score += eff.targetType === 'creature' ? 25 : 15;
                            }
                        }
                    }
                    // Penalty for destroying own stuff
                    var ownBf = match.game.zones?.[seat]?.battlefield || [];
                    for (var oi = 0; oi < ownBf.length; oi++) {
                        if (engineMatchesTypeFilter(match, seat, ownBf[oi], eff.targetType)) {
                            if (eff.cmcFilter) {
                                var oc = Number(engineCardMeta(match, seat, ownBf[oi])?.cmc) || 0;
                                if (eff.cmcFilter.direction === 'less' && oc > eff.cmcFilter.value) continue;
                                if (eff.cmcFilter.direction === 'greater' && oc < eff.cmcFilter.value) continue;
                            }
                            score -= eff.targetType === 'creature' ? 20 : 10;
                        }
                    }
                } else if (eff.type === 'destroy' || eff.type === 'exile') { score += 30; }
                else if (eff.type === 'draw') { score += 20 * (eff.amount || 1); }
                else if (eff.type === 'gainLife') { score += 5; }
                else if (eff.type === 'damage') { score += 15; }
                else { score += 5; }
            }
            modeScores.push({ idx: mi, score: score });
        }
        modeScores.sort(function(a, b) { return b.score - a.score; });
        var selected = [];
        for (var pi = 0; pi < modeScores.length && selected.length < modalInfo.maxChoices; pi++) {
            if (modeScores[pi].score > 0 || selected.length < modalInfo.minChoices) {
                selected.push(modeScores[pi].idx);
            }
        }
        if (selected.length < modalInfo.minChoices) {
            // Must pick at least minChoices even if scores are negative
            for (var fi = 0; fi < modeScores.length && selected.length < modalInfo.minChoices; fi++) {
                if (selected.indexOf(modeScores[fi].idx) < 0) selected.push(modeScores[fi].idx);
            }
        }
        return selected.length >= modalInfo.minChoices ? selected : null;
    };

    var botPlayCard = function(cardId) {
        if (engineIsAura(match, seat, cardId)) {
            var target = botAuraTarget(cardId);
            if (!target) return false;
            enginePlayCard(match, seat, cardId, target);
        } else if (engineIsSpell(match, seat, cardId)) {
            var meta = engineBotCardMeta(match, seat, cardId);
            // Check for modal spell first
            var modalModes = botSelectModes(cardId);
            if (modalModes) {
                // Modal spell: check if any selected mode needs a target
                var modalInfo = engineParseModalModes(meta?.oracleText);
                var modalEffects = [];
                for (var mmi = 0; mmi < modalModes.length; mmi++) {
                    var mIdx = modalModes[mmi];
                    if (modalInfo && mIdx < modalInfo.modes.length) {
                        var me = modalInfo.modes[mIdx].effects;
                        for (var mej = 0; mej < me.length; mej++) modalEffects.push(me[mej]);
                    }
                }
                var modalTarget = null;
                if (engineEffectNeedsTarget(modalEffects)) {
                    modalTarget = botPickSpellTarget(cardId);
                    if (!modalTarget) return false;
                }
                enginePlayCard(match, seat, cardId, modalTarget, modalModes);
            } else {
                // Non-modal spell
                var spellTarget = botPickSpellTarget(cardId);
                var effects = engineParseSpellEffects(meta?.oracleText);
                if (engineEffectNeedsTarget(effects) && !spellTarget) return false;
                enginePlayCard(match, seat, cardId, spellTarget);
            }
        } else {
            enginePlayCard(match, seat, cardId);
        }
        // Auto-resolve scry if a spell/ETB triggered it
        engineBotResolveScry(match, seat);
        return true;
    };

    var botIsLand = function(id) { return engineCardType(match, seat, id) === "land"; };

    if (diff === "easy") {
        // Easy: shuffle hand, try to play 1-2 cards (retry on failure instead of giving up)
        var easyShuffled = affordable.slice();
        for (var esi = easyShuffled.length - 1; esi > 0; esi--) { var eri = sup.random.integer(0, esi); var etmp = easyShuffled[esi]; easyShuffled[esi] = easyShuffled[eri]; easyShuffled[eri] = etmp; }
        var easyPlayed = 0;
        var easyMax = sup.random.integer(1, 2);
        for (var ei = 0; ei < easyShuffled.length && easyPlayed < easyMax; ei++) {
            var easyCard = easyShuffled[ei];
            if (getCmc(easyCard) > mana.current) continue;
            if (botIsLand(easyCard) && (match.game.landsPlayedThisTurn || 0) >= 1) continue;
            if (botPlayCard(easyCard)) {
                if (botIsLand(easyCard)) match.game.landsPlayedThisTurn = (match.game.landsPlayedThisTurn || 0) + 1;
                mana.current = Math.max(0, mana.current - getCmc(easyCard));
                played.push(easyCard);
                easyPlayed++;
            }
        }
    } else if (diff === "medium") {
        // Medium: sort by card impact (creatures first for sequencing, then removal/buffs)
        const sorted = affordable.slice().sort(function(a, b) {
            var sa = engineBotCardImpactScore(match, seat, a);
            var sb = engineBotCardImpactScore(match, seat, b);
            if (sb !== sa) return sb - sa;
            return getCmc(a) - getCmc(b); // CMC ascending tiebreaker
        });
        for (const cardId of sorted) {
            if (getCmc(cardId) > mana.current) continue;
            if (botIsLand(cardId) && (match.game.landsPlayedThisTurn || 0) >= 1) continue;
            if (botPlayCard(cardId)) {
                if (botIsLand(cardId)) match.game.landsPlayedThisTurn = (match.game.landsPlayedThisTurn || 0) + 1;
                mana.current = Math.max(0, mana.current - getCmc(cardId));
                played.push(cardId);
            }
        }
    } else {
        // Hard: sort by card impact (removal > strong creatures > buffs), cap board at 6
        const sorted = affordable.slice().sort(function(a, b) {
            var sa = engineBotCardImpactScore(match, seat, a);
            var sb = engineBotCardImpactScore(match, seat, b);
            return sb - sa; // highest impact first
        });
        for (const cardId of sorted) {
            if (getCmc(cardId) > mana.current) continue;
            if (bf.length >= 6) break;
            if (botIsLand(cardId) && (match.game.landsPlayedThisTurn || 0) >= 1) continue;
            if (botPlayCard(cardId)) {
                if (botIsLand(cardId)) match.game.landsPlayedThisTurn = (match.game.landsPlayedThisTurn || 0) + 1;
                mana.current = Math.max(0, mana.current - getCmc(cardId));
                played.push(cardId);
            }
        }
    }

    if (played.length) {
        for (const cardId of played) {
            var logType = engineIsSpell(match, seat, cardId) ? "BOT_CAST_SPELL" : "BOT_PLAY";
            match.log.push({ t: Date.now(), type: logType, by: "bot", seat, difficulty: diff, cardId });
        }
    } else if (!skipCardPlay) {
        match.log.push({ t: Date.now(), type: "BOT_PASS", by: "bot", seat, difficulty: diff });
    }
    } // end if (!skipCardPlay)
    // Bot equip phase: equip unattached equipment to strongest creature
    var botBf = match.game.zones?.[seat]?.battlefield || [];
    var eqAtch = match.game.equipmentAttachments || {};
    for (var eqi = 0; eqi < botBf.length; eqi++) {
        var eqCid = botBf[eqi];
        if (!engineIsEquipment(match, seat, eqCid)) continue;
        if (eqAtch[eqCid]) continue; // already attached
        var eqCost = engineParseEquipCost(match, seat, eqCid);
        if (eqCost === null || eqCost > mana.current) continue;
        // Find strongest own creature
        var bestEqTarget = null; var bestEqPow = -1;
        for (var eci = 0; eci < botBf.length; eci++) {
            if (!engineIsCreature(match, seat, botBf[eci])) continue;
            var eqPow = engineGetCreaturePower(match, seat, botBf[eci]);
            if (eqPow > bestEqPow) { bestEqPow = eqPow; bestEqTarget = botBf[eci]; }
        }
        if (bestEqTarget) {
            if (!match.game.equipmentAttachments) match.game.equipmentAttachments = {};
            match.game.equipmentAttachments[eqCid] = bestEqTarget;
            mana.current = Math.max(0, mana.current - eqCost);
            match.log.push({ t: Date.now(), type: "BOT_EQUIP", by: "bot", seat: seat, cardId: eqCid, targetId: bestEqTarget });
        }
    }
    // Bot scry auto-resolve: if a spell/ETB triggered scry for the bot, resolve it
    engineBotResolveScry(match, seat);
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
    if (match.game?.status !== "finished") {
        // Bot discard to hand size (default 7)
        engineEnsureZones(match, seat);
        var botHand = match.game.zones[seat]?.hand || [];
        var botMaxHS = engineGetMaxHandSize(match, seat);
        if (botHand.length > botMaxHS) {
            var discN = botHand.length - botMaxHS;
            // Discard highest CMC cards first
            var sortedHand = botHand.slice().sort(function(a, b) {
                return (Number(engineCardMeta(match, seat, b)?.cmc) || 0) - (Number(engineCardMeta(match, seat, a)?.cmc) || 0);
            });
            for (var dsi = 0; dsi < discN; dsi++) {
                engineMoveCard(match, seat, "hand", "graveyard", sortedHand[dsi]);
            }
            match.log.push({ t: Date.now(), type: "BOT_DISCARD", by: "bot", seat: seat, count: discN });
        }
        // Check if any human has castable instants before ending bot turn
        var instantCheck = engineHumanHasInstants(match);
        if (instantCheck) {
            match.game.responseWindow = { seat: instantCheck.seat, reason: 'bot_turn_end' };
            match.log.push({ t: Date.now(), type: "RESPONSE_WINDOW", seat: instantCheck.seat });
        } else {
            engineAdvanceTurn(match, { by: "bot" });
        }
    }
}

function engineBotResolveScry(match, seat) {
    var scry = match.game?.scryPending;
    if (!scry || scry.seat !== seat) return;
    // Score each card: creatures and spells by CMC (higher = better to keep on top for bot), lands are low priority
    engineEnsureZones(match, seat);
    var lib = match.game.zones[seat].library;
    var topIds = [];
    var bottomIds = [];
    var scored = [];
    for (var i = 0; i < scry.cardIds.length; i++) {
        var cid = scry.cardIds[i];
        var meta = engineCardMeta(match, seat, cid);
        var score = 0;
        if (meta) {
            var tl = String(meta.typeLine || '').toLowerCase();
            if (tl.includes('land')) {
                // Lands: keep if bot has few lands on battlefield
                var botBfCheck = match.game.zones[seat].battlefield || [];
                var landCount = 0;
                for (var li = 0; li < botBfCheck.length; li++) {
                    if (engineBotIsLand(match, seat, botBfCheck[li])) landCount++;
                }
                score = landCount < 4 ? 5 : -1; // Keep lands if few on board
            } else {
                score = Number(meta.cmc) || 1; // Higher CMC cards scored higher
                if (tl.includes('creature')) score += 2;
                // Removal spells get bonus
                var oracle = String(meta.oracleText || '').toLowerCase();
                if (/destroy|exile|damage/.test(oracle)) score += 3;
            }
        }
        scored.push({ id: cid, score: score });
    }
    // Sort by score descending — best cards kept on top
    scored.sort(function(a, b) { return b.score - a.score; });
    for (var si = 0; si < scored.length; si++) {
        if (scored[si].score >= 0) topIds.push(scored[si].id);
        else bottomIds.push(scored[si].id);
    }
    // Apply reorder
    lib.splice(0, scry.count);
    for (var sti = topIds.length - 1; sti >= 0; sti--) {
        lib.unshift(topIds[sti]);
    }
    for (var sbi = 0; sbi < bottomIds.length; sbi++) {
        lib.push(bottomIds[sbi]);
    }
    delete match.game.scryPending;
    match.log.push({ t: Date.now(), type: "BOT_SCRY_RESOLVE", by: "bot", seat: seat, keptOnTop: topIds.length, sentToBottom: bottomIds.length });
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
        if (engineHasKeyword(match, seat, cid, "Defender")) continue;
        var cs = match.game.cardState[cid];
        if (cs && cs.tapped) continue;
        if (cs && cs.summoningSick) continue;
        eligible.push(cid);
    }
    if (!eligible.length) return false;
    // Find a target seat — pick strategically in multiplayer
    var allSeats = engineSeatOrder(match);
    var losers = match.game?.losers || [];
    var opponentSeats = [];
    for (var si = 0; si < allSeats.length; si++) {
        if (allSeats[si] !== seat && losers.indexOf(allSeats[si]) < 0) opponentSeats.push(allSeats[si]);
    }
    if (!opponentSeats.length) return false;
    var targetSeat = opponentSeats[0];
    if (opponentSeats.length > 1) {
        // Multiplayer: pick target by lowest life (most vulnerable)
        var bestScore = -Infinity;
        for (var ti = 0; ti < opponentSeats.length; ti++) {
            var ts = opponentSeats[ti];
            var life = match.game.lifeBySeat?.[ts] ?? 40;
            var oppBfCount = 0;
            var oppBfArr = match.game.zones?.[ts]?.battlefield || [];
            for (var tbi = 0; tbi < oppBfArr.length; tbi++) { if (engineIsCreature(match, ts, oppBfArr[tbi])) oppBfCount++; }
            // Score: lower life = higher priority, fewer creatures = easier target
            var score = (100 - life) + (10 - Math.min(oppBfCount, 10)) * 2;
            // Add randomness so bots don't all pile on the same target
            score += sup.random.integer(0, 15);
            if (score > bestScore) { bestScore = score; targetSeat = ts; }
        }
    }
    var chosen = [];
    // Lethal detection — if we can kill the target, go all-in regardless of difficulty
    var targetLife = match.game.lifeBySeat?.[targetSeat] ?? 40;
    var totalEligPower = 0;
    var evasivePower = 0;
    for (var lci = 0; lci < eligible.length; lci++) {
        var ePw = engineGetCreaturePower(match, seat, eligible[lci]);
        totalEligPower += ePw;
        if (engineHasKeyword(match, seat, eligible[lci], "Flying") || engineHasKeyword(match, seat, eligible[lci], "Trample") || engineHasKeyword(match, seat, eligible[lci], "Menace")) {
            evasivePower += ePw;
        }
    }
    if (diff !== "easy" && (totalEligPower >= targetLife || evasivePower >= targetLife)) {
        // Go for lethal — attack with everything
        chosen = eligible.slice();
    } else if (diff === "easy") {
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
        // Hard: keyword-aware scoring for each eligible attacker
        var oppBf2 = match.game.zones?.[targetSeat]?.battlefield || [];
        var oppMaxToughness = 0;
        var oppHasUntappedDT = false;
        for (var oi3 = 0; oi3 < oppBf2.length; oi3++) {
            if (engineIsCreature(match, targetSeat, oppBf2[oi3])) {
                var ot = engineGetCreatureToughness(match, targetSeat, oppBf2[oi3]);
                if (ot > oppMaxToughness) oppMaxToughness = ot;
                var ocs = match.game.cardState[oppBf2[oi3]];
                if ((!ocs || !ocs.tapped) && engineHasKeyword(match, targetSeat, oppBf2[oi3], "Deathtouch")) oppHasUntappedDT = true;
            }
        }
        for (var ei2 = 0; ei2 < eligible.length; ei2++) {
            var eid = eligible[ei2];
            var pw = engineGetCreaturePower(match, seat, eid);
            var tw = engineGetCreatureToughness(match, seat, eid);
            var atkScore = 0;
            if (pw >= 3) atkScore += 3;
            if (pw >= oppMaxToughness) atkScore += 2;
            if (tw > oppMaxToughness) atkScore += 2;
            // Keyword bonuses
            if (engineHasKeyword(match, seat, eid, "Flying")) atkScore += 4;
            if (engineHasKeyword(match, seat, eid, "Menace")) atkScore += 4;
            if (engineHasKeyword(match, seat, eid, "Trample")) atkScore += 2;
            if (engineHasKeyword(match, seat, eid, "Lifelink")) atkScore += 2;
            if (engineHasKeyword(match, seat, eid, "First Strike") || engineHasKeyword(match, seat, eid, "Double Strike")) atkScore += 2;
            if (engineHasKeyword(match, seat, eid, "Indestructible")) atkScore += 5;
            if (engineHasKeyword(match, seat, eid, "Vigilance")) atkScore += 4;
            // Penalty if opponent has untapped deathtouch blocker
            if (oppHasUntappedDT && !engineHasKeyword(match, seat, eid, "Indestructible")) atkScore -= 3;
            if (atkScore >= 3) chosen.push(eid);
        }
    }
    if (!chosen.length) return false;
    // Set up combat
    match.game.combat = { attackers: {}, blockers: {}, resolved: false };
    for (var ci = 0; ci < chosen.length; ci++) {
        match.game.combat.attackers[chosen[ci]] = targetSeat;
        if (!match.game.cardState[chosen[ci]]) match.game.cardState[chosen[ci]] = { tapped: false, summoningSick: false, damage: 0, damageSourceIds: [] };
        if (!engineHasKeyword(match, seat, chosen[ci], "Vigilance")) {
            match.game.cardState[chosen[ci]].tapped = true;
        }
    }
    match.game.step = "combat_attackers";
    match.log.push({ t: Date.now(), type: "ATTACKERS_DECLARED", by: "bot", seat: seat, count: chosen.length, targetSeat: targetSeat });
    return true;
}

function engineBotCanBlock(match, blockerSeat, blockerId, attackerId) {
    var atkSeat = engineFindSeatForCard(match, attackerId);
    if (!atkSeat) return false;
    if (engineHasKeyword(match, atkSeat, attackerId, "Flying") && !engineHasKeyword(match, blockerSeat, blockerId, "Flying") && !engineHasKeyword(match, blockerSeat, blockerId, "Reach")) return false;
    // Menace no longer blocks individual assignment — checked at group level
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
    var usedBlockers = {};
    // Helper to check if attacker has Menace
    var hasMenace = function(atkId) { var as = engineFindSeatForCard(match, atkId); return as && engineHasKeyword(match, as, atkId, "Menace"); };

    if (diff === "easy") {
        // Easy: block randomly — 1:1, skip Menace attackers
        var shuffled = eligibleBlockers.slice();
        for (var si = shuffled.length - 1; si > 0; si--) { var ri = sup.random.integer(0, si); var tmp = shuffled[si]; shuffled[si] = shuffled[ri]; shuffled[ri] = tmp; }
        var bIdx = 0;
        for (var bi = 0; bi < incomingAttackers.length && bIdx < shuffled.length; bi++) {
            if (hasMenace(incomingAttackers[bi])) continue; // Easy skips Menace
            if (!engineBotCanBlock(match, seat, shuffled[bIdx], incomingAttackers[bi])) continue;
            match.game.combat.blockers[incomingAttackers[bi]] = [shuffled[bIdx]];
            usedBlockers[shuffled[bIdx]] = true;
            bIdx++;
        }
    } else if (diff === "medium") {
        // Medium: Pass 1 — block if we can kill the attacker (favorable trade)
        for (var ai = 0; ai < incomingAttackers.length; ai++) {
            var atkId = incomingAttackers[ai];
            if (hasMenace(atkId)) continue;
            var atkSeat = engineFindSeatForCard(match, atkId);
            if (!atkSeat) continue;
            var atkTough = engineGetCreatureToughness(match, atkSeat, atkId);
            for (var bi2 = 0; bi2 < eligibleBlockers.length; bi2++) {
                var blkId = eligibleBlockers[bi2];
                if (usedBlockers[blkId]) continue;
                if (!engineBotCanBlock(match, seat, blkId, atkId)) continue;
                var blkPow = engineGetCreaturePower(match, seat, blkId);
                if (blkPow >= atkTough || engineHasKeyword(match, seat, blkId, "Deathtouch")) {
                    match.game.combat.blockers[atkId] = [blkId];
                    usedBlockers[blkId] = true;
                    break;
                }
            }
        }
        // Pass 2 — chump-block big threats (power >= 4) and evasive creatures to save life
        for (var ai1b = 0; ai1b < incomingAttackers.length; ai1b++) {
            var atkId1b = incomingAttackers[ai1b];
            if (match.game.combat.blockers[atkId1b]) continue; // already blocked
            if (hasMenace(atkId1b)) continue;
            var atkSeat1b = engineFindSeatForCard(match, atkId1b);
            if (!atkSeat1b) continue;
            var atkPow1b = engineGetCreaturePower(match, atkSeat1b, atkId1b);
            var isEvasive = engineHasKeyword(match, atkSeat1b, atkId1b, "Flying") || engineHasKeyword(match, atkSeat1b, atkId1b, "Trample");
            if (atkPow1b >= 4 || isEvasive) {
                // Find smallest available blocker to chump
                var smallBlk = null; var smallPow = Infinity;
                for (var sbi = 0; sbi < eligibleBlockers.length; sbi++) {
                    var sbId = eligibleBlockers[sbi];
                    if (usedBlockers[sbId]) continue;
                    if (!engineBotCanBlock(match, seat, sbId, atkId1b)) continue;
                    var sbPow = engineGetCreaturePower(match, seat, sbId);
                    if (sbPow < smallPow) { smallPow = sbPow; smallBlk = sbId; }
                }
                if (smallBlk) {
                    match.game.combat.blockers[atkId1b] = [smallBlk];
                    usedBlockers[smallBlk] = true;
                }
            }
        }
    } else {
        // Hard: scoring system with keyword awareness
        for (var ai2 = 0; ai2 < incomingAttackers.length; ai2++) {
            var atkId2 = incomingAttackers[ai2];
            if (hasMenace(atkId2)) continue; // Handle Menace in second pass
            var atkSeat2 = engineFindSeatForCard(match, atkId2);
            if (!atkSeat2) continue;
            var atkPow2 = engineGetCreaturePower(match, atkSeat2, atkId2);
            var atkTough2 = engineGetCreatureToughness(match, atkSeat2, atkId2);
            var bestBlk = null;
            var bestScore = -999;
            for (var bi3 = 0; bi3 < eligibleBlockers.length; bi3++) {
                var blkId2 = eligibleBlockers[bi3];
                if (usedBlockers[blkId2]) continue;
                if (!engineBotCanBlock(match, seat, blkId2, atkId2)) continue;
                var blkPow2 = engineGetCreaturePower(match, seat, blkId2);
                var blkTough2 = engineGetCreatureToughness(match, seat, blkId2);
                var score = 0;
                if (blkPow2 >= atkTough2) score += 10;
                if (engineHasKeyword(match, seat, blkId2, "Deathtouch")) score += 10;
                if (atkPow2 < blkTough2) score += 5;
                if (engineHasKeyword(match, seat, blkId2, "Indestructible")) score += 8;
                if (engineHasKeyword(match, seat, blkId2, "First Strike") || engineHasKeyword(match, seat, blkId2, "Double Strike")) {
                    if (blkPow2 >= atkTough2 || engineHasKeyword(match, seat, blkId2, "Deathtouch")) score += 5;
                }
                if (engineHasKeyword(match, seat, blkId2, "Lifelink")) score += 2;
                if (atkPow2 >= blkTough2 && blkPow2 < atkTough2 && !engineHasKeyword(match, seat, blkId2, "Deathtouch") && !engineHasKeyword(match, seat, blkId2, "Indestructible")) score -= 3;
                if (atkPow2 >= 4) score += 3;
                if (engineHasKeyword(match, atkSeat2, atkId2, "Trample")) score -= 2;
                if (engineHasKeyword(match, atkSeat2, atkId2, "Deathtouch") && !engineHasKeyword(match, seat, blkId2, "Indestructible")) score -= 5;
                if ((engineHasKeyword(match, atkSeat2, atkId2, "First Strike") || engineHasKeyword(match, atkSeat2, atkId2, "Double Strike")) && atkPow2 >= blkTough2 && !engineHasKeyword(match, seat, blkId2, "Indestructible")) score -= 4;
                if (score > bestScore) { bestScore = score; bestBlk = blkId2; }
            }
            if (bestBlk && bestScore > 0) {
                match.game.combat.blockers[atkId2] = [bestBlk];
                usedBlockers[bestBlk] = true;
            }
        }
        // Hard second pass: Menace attackers — find 2 eligible blockers
        for (var mi = 0; mi < incomingAttackers.length; mi++) {
            var mAtkId = incomingAttackers[mi];
            if (!hasMenace(mAtkId)) continue;
            var mAtkSeat = engineFindSeatForCard(match, mAtkId);
            if (!mAtkSeat) continue;
            var mAtkPow = engineGetCreaturePower(match, mAtkSeat, mAtkId);
            var mAtkTough = engineGetCreatureToughness(match, mAtkSeat, mAtkId);
            // Find 2 blockers that can legally block this attacker
            var candidates = [];
            for (var mc = 0; mc < eligibleBlockers.length; mc++) {
                if (usedBlockers[eligibleBlockers[mc]]) continue;
                if (!engineBotCanBlock(match, seat, eligibleBlockers[mc], mAtkId)) continue;
                candidates.push(eligibleBlockers[mc]);
            }
            if (candidates.length < 2) continue;
            // Only block if combined power can kill attacker OR attacker power >= 4
            var combinedPow = 0;
            for (var cp = 0; cp < Math.min(2, candidates.length); cp++) { combinedPow += engineGetCreaturePower(match, seat, candidates[cp]); }
            if (combinedPow >= mAtkTough || mAtkPow >= 4) {
                match.game.combat.blockers[mAtkId] = [candidates[0], candidates[1]];
                usedBlockers[candidates[0]] = true;
                usedBlockers[candidates[1]] = true;
            }
        }
    }
    var blockerCount = 0;
    for (var bk in match.game.combat.blockers) {
        var bArr = match.game.combat.blockers[bk];
        blockerCount += Array.isArray(bArr) ? bArr.length : 1;
    }
    if (blockerCount) {
        match.log.push({ t: Date.now(), type: "BLOCKERS_DECLARED", by: "bot", seat: seat, count: blockerCount });
    }
}

function baseCardId(instanceId) {
    if (typeof instanceId !== 'string') return instanceId;
    var idx = instanceId.lastIndexOf(':');
    if (idx < 0) return instanceId;
    var suffix = instanceId.substring(idx + 1);
    // Only strip if suffix is a number (instance index)
    if (/^\d+$/.test(suffix)) return instanceId.substring(0, idx);
    return instanceId;
}

function expandDeckToList(cardsById) {
    const list = [];
    for (const [id, count] of Object.entries(cardsById || {})) {
        var n = Number(count) || 0;
        if (n === 1) { list.push(id); }
        else { for (let i = 0; i < n; i++) list.push(id + ':' + i); }
    }
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
    // Hide scryPending card IDs from non-scrying players
    if (out.game?.scryPending && out.game.scryPending.seat !== out.viewerSeat) {
        out.game.scryPending = { seat: out.game.scryPending.seat, count: out.game.scryPending.count };
    }
    return out;
}

// --- Scryfall caching ---

var SCRYFALL_CACHE_MAX = 400;

function scryfallCacheGet(cache, url) {
    const hit = cache[url];
    if (hit && hit.at && Date.now() - hit.at < 1000 * 60 * 60 * 24 * 7) return hit.json;
    if (hit) delete cache[url];
    return null;
}

function scryfallCacheSet(cache, url, json) {
    cache[url] = { at: Date.now(), json };
    var keys = Object.keys(cache);
    if (keys.length > SCRYFALL_CACHE_MAX) {
        keys.sort(function(a, b) { return (cache[a].at || 0) - (cache[b].at || 0); });
        var toRemove = keys.length - SCRYFALL_CACHE_MAX;
        for (var i = 0; i < toRemove; i++) delete cache[keys[i]];
    }
}

// Rate-limit Scryfall: track last request time, enforce 120ms gap
var _scryfallLastFetch = 0;
function scryfallRateLimit() {
    var now = Date.now();
    var elapsed = now - _scryfallLastFetch;
    if (elapsed < 120) {
        var wait = 120 - elapsed;
        var end = Date.now() + wait;
        while (Date.now() < end) {} // busy-wait (sync environment)
    }
    _scryfallLastFetch = Date.now();
}

function scryfallFetchWithRetry(url, opts) {
    var maxRetries = 2;
    for (var attempt = 0; attempt <= maxRetries; attempt++) {
        scryfallRateLimit();
        try {
            var res = sup.fetch(url, opts || { headers: { "User-Agent": "SupMTG/0 (contact: @heyhaigh)", Accept: "application/json" } });
            var json = res.json();
            // Scryfall returns { object: 'error', status: 429 } on rate limit
            if (json && json.object === 'error' && json.status === 429 && attempt < maxRetries) {
                var backoff = 500 * (attempt + 1);
                var end = Date.now() + backoff;
                while (Date.now() < end) {}
                continue;
            }
            return json;
        } catch (e) {
            if (attempt >= maxRetries) throw e;
            var backoff = 500 * (attempt + 1);
            var end = Date.now() + backoff;
            while (Date.now() < end) {}
        }
    }
    return null;
}

function scryfallFetchJsonCached(url) {
    const cache = sup.global.get(GLOBAL_SCRYFALL_CACHE_KEY) || {};
    const cached = scryfallCacheGet(cache, url);
    if (cached) return cached;
    const json = scryfallFetchWithRetry(url);
    if (json) { scryfallCacheSet(cache, url, json); sup.global.set(GLOBAL_SCRYFALL_CACHE_KEY, cache); }
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
        const json = scryfallFetchWithRetry(SCRYFALL.collection, { method: "POST", headers: { "User-Agent": "SupMTG/0 (contact: @heyhaigh)", Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify(body) });
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
    return { id: card.id, name: card.name, typeLine: card.type_line, manaCost: card.mana_cost, imageSmall, imageNormal, legalities: card.legalities, cmc: card.cmc, colors: card.colors, colorIdentity: card.color_identity, set: card.set, collectorNumber: card.collector_number, power: card.power != null ? String(card.power) : null, toughness: card.toughness != null ? String(card.toughness) : null, keywords: Array.isArray(card.keywords) ? card.keywords : [], oracleText: card.oracle_text || '' };
}
