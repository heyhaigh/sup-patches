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
    .kwIcons { position:absolute; display:flex; gap:2px; z-index:3; pointer-events:none; }
    .kwIcons-tl { top:3px; left:3px; flex-direction:column; }
    .kwIcons-tr { top:3px; right:3px; flex-direction:column; align-items:flex-end; }
    .kwIcons-bl { bottom:20px; left:3px; flex-direction:column; }
    .kwIcon { width:16px; height:16px; background:rgba(0,0,0,0.72); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:9px; line-height:1; border:1px solid rgba(255,255,255,0.15); color:#fff; }
    .kwPill { display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:700; background:rgba(59,130,246,0.12); color:#3b82f6; border:1px solid rgba(59,130,246,0.25); }
    .kwPillUnsupported { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.45); border-color:rgba(255,255,255,0.1); }
    .cardModalKeywords { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
    .cardModalWarn { margin-top:10px; padding:8px 12px; border-radius:8px; font-size:12px; color:#f59e0b; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.2); }
    .cardModalAuras { margin-top:10px; font-size:12px; color:var(--muted); }
    .cardModalAuras strong { color:var(--text); font-weight:700; }
    .cardWrap.canTarget { box-shadow:0 0 8px 2px rgba(168,85,247,0.5); border-radius:12px; cursor:pointer; }
    .cardWrap.targetSelected { box-shadow:0 0 10px 3px rgba(168,85,247,0.7); border-radius:12px; transform:translateY(-6px); }
    .cardWrap.targetIneligible .cardImg { opacity:0.35; filter:saturate(0.2); }
    .targetBanner { display:flex; align-items:center; justify-content:center; gap:8px; padding:6px 14px; background:rgba(168,85,247,0.12); border:1px solid rgba(168,85,247,0.25); border-radius:10px; color:rgba(255,255,255,0.9); font-size:13px; font-weight:700; }
    .auraBadge { position:absolute; bottom:20px; left:50%; transform:translateX(-50%); background:rgba(168,85,247,0.85); color:#fff; font-size:9px; font-weight:700; padding:1px 5px; border-radius:4px; pointer-events:none; z-index:3; border:1px solid rgba(255,255,255,0.2); }
    .ptBuffed { color:#22c55e; }
    .phaseBar { display:flex; gap:4px; align-items:center; }
    .phasePill { padding:3px 8px; border-radius:6px; font-size:10px; font-weight:700; text-transform:uppercase; background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.35); border:1px solid rgba(255,255,255,0.06); }
    .phasePill.active { background:rgba(251,191,36,0.18); color:#fbbf24; border-color:rgba(251,191,36,0.35); }
    .dmgFloat { position:absolute; font-size:24px; font-weight:900; color:#ef4444; text-shadow:0 2px 8px rgba(0,0,0,0.5); pointer-events:none; z-index:30; animation:dmgFloatUp 1.2s ease-out forwards; }
    @keyframes dmgFloatUp { 0%{opacity:1;transform:translateY(0) scale(1.2)} 60%{opacity:1;transform:translateY(-30px) scale(1)} 100%{opacity:0;transform:translateY(-50px) scale(0.8)} }
    .dmgFloatHeal { position:absolute; font-size:24px; font-weight:900; color:#22c55e; text-shadow:0 2px 8px rgba(0,0,0,0.5); pointer-events:none; z-index:30; animation:dmgFloatUp 1.2s ease-out forwards; }
    .deathOverlay { position:absolute; z-index:25; border-radius:10px; pointer-events:none; display:flex; align-items:center; justify-content:center; font-size:32px; animation:deathFade 0.8s ease-out forwards; }
    @keyframes deathFade { 0%{background:rgba(239,68,68,0.4);opacity:1} 30%{background:rgba(239,68,68,0.2);opacity:1} 100%{background:transparent;opacity:0} }
    .combatBanner { display:flex; align-items:center; justify-content:center; gap:8px; padding:6px 14px; background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.25); border-radius:10px; color:rgba(255,255,255,0.9); font-size:13px; font-weight:700; }
    .gameOverOverlay { position:absolute; inset:0; z-index:40; background:rgba(0,0,0,0.7); backdrop-filter:blur(4px); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; animation:gameOverIn 0.4s ease; }
    @keyframes gameOverIn { from{opacity:0} to{opacity:1} }
    .gameOverTitle { font-size:48px; font-weight:900; letter-spacing:-0.03em; text-shadow:0 4px 20px rgba(0,0,0,0.5); animation:gameOverPop 0.5s ease; }
    @keyframes gameOverPop { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
    .gameOverTitle.victory { color:#22c55e; }
    .gameOverTitle.defeat { color:#ef4444; }
    .gameOverStats { display:flex; gap:16px; flex-wrap:wrap; justify-content:center; }
    .gameOverStat { padding:8px 14px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); border-radius:10px; text-align:center; }
    .gameOverStatVal { font-size:20px; font-weight:800; color:#fff; }
    .gameOverStatLabel { font-size:11px; color:rgba(255,255,255,0.6); margin-top:2px; }
    .gameOverBtns { display:flex; gap:10px; margin-top:8px; }
    .lifeBadge.critical { background:rgba(239,68,68,0.25); border-color:rgba(239,68,68,0.4); animation:lifePulse 1s ease infinite; }
    @keyframes lifePulse { 0%,100%{box-shadow:none} 50%{box-shadow:0 0 12px rgba(239,68,68,0.4)} }
    .lifeBadge.flash { animation:lifeFlash 0.4s ease; }
    @keyframes lifeFlash { 0%{background:rgba(239,68,68,0.5)} 100%{background:rgba(255,255,255,0.12)} }
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
    .zoneBrowserOverlay { position:fixed; inset:0; z-index:50; background:rgba(0,0,0,0.7); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; animation:gameOverIn 0.3s ease; }
    .zoneBrowserContent { background:var(--surface); border-radius:var(--radius); box-shadow:var(--shadow); max-width:600px; width:90vw; max-height:80vh; overflow:auto; padding:16px; position:relative; }
    .zoneBrowserTitle { font-size:16px; font-weight:700; margin:0 0 12px 0; }
    .zoneBrowserClose { position:absolute; top:10px; right:12px; background:none; border:none; font-size:20px; cursor:pointer; color:var(--muted); padding:4px 8px; }
    .zoneBrowserGrid { display:grid; grid-template-columns:repeat(auto-fill, minmax(100px, 1fr)); gap:10px; }
    .zoneBrowserGrid .cardImg { width:100%; height:auto; aspect-ratio:5/7; border-radius:8px; cursor:pointer; transition:transform 120ms ease; border:1px solid var(--border); }
    .zoneBrowserGrid .cardImg:hover { transform:scale(1.05); }
    .zoneBrowserEmpty { color:var(--muted); font-size:13px; font-style:italic; text-align:center; padding:20px 0; }
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
    targetingMode: null,
    lastLogIndex: 0,
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
    $$('.tabPanel').forEach(el => { el.style.display = 'none'; });
    $('#tab-' + tab).style.display = 'block';
    $$('.tabBtn').forEach(btn => { btn.classList.toggle('active', btn.dataset.tab === tab); });
    var c = document.querySelector('.content'); if (c) c.scrollTop = 0;
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
    state.prevLifeBySeat = {};
    state.lastLogIndex = 0;
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
      var abilityPatterns = /\b(when|whenever|at the beginning|sacrifice|create|counter|destroy|exile|return|put|search|discard|draw|gain|lose|pay|tap|untap|transform|equip|attach|enchant|fight|mill|scry|surveil|venture|explore|populate|proliferate|amass|adapt|monstrosity|ward|protection from|shroud|flash|wither|infect|persist|undying|affinity|cascade|convoke|delve|emerge|mutate|dash|evoke|ninjutsu|prowl|bestow|morph|kicker|madness|aftermath|fuse|overload|splice|entwine|escalate|strive|devour|exploit|fabricate|extort|tribute|riot|spectacle|escape|foretell|disturb|daybound|nightbound|champion|changeling|living weapon)\b/i;
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
    var re = /([+-]\d+)\/([+-]\d+)/g;
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

  function getTargetableCreatures(match, casterSeat) {
    var targets = [];
    var seats = (match.players || []).map(function(p) { return p.seat; });
    for (var si = 0; si < seats.length; si++) {
      var s = seats[si];
      var bf = match?.game?.zones?.[s]?.battlefield || [];
      for (var ci = 0; ci < bf.length; ci++) {
        var cid = bf[ci];
        if (clientCardType(cid) !== 'creature') continue;
        // Hexproof: opponent's Hexproof creatures can't be targeted
        if (s !== casterSeat && clientHasKeyword(cid, 'Hexproof')) continue;
        targets.push(cid);
      }
    }
    return targets;
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
    state.targetingMode = null;
    if (isSpellTarget) { showSpellCastAnimation(cardId); } else { showCardFlyAnimation(cardId); }
    var res = await supExec('api_matchAction', { matchId: state.activeMatchId, action: { type: 'PLAY_FROM_HAND', cardId: cardId, targetId: targetId } });
    if (!res.ok) { toast('Play failed: ' + (res.error || 'unknown'), { type: 'error' }); return; }
    await refreshMatch();
  }

  function cancelTargeting() {
    state.targetingMode = null;
    renderGame(state.lastMatch);
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
      var kwTLNames = ['Haste','Vigilance','Defender','Indestructible','Hexproof'];
      var kwTRNames = ['Flying','Reach','First Strike','Double Strike','Menace'];
      var kwBLNames = ['Trample','Deathtouch','Lifelink'];
      var myKws = clientGetKeywords(id);
      for (var ki = 0; ki < myKws.length; ki++) {
        var kw = myKws[ki];
        if (!kwMap[kw]) continue;
        if (kwTLNames.indexOf(kw) >= 0) kwTL.push(kw);
        else if (kwTRNames.indexOf(kw) >= 0) kwTR.push(kw);
        else if (kwBLNames.indexOf(kw) >= 0) kwBL.push(kw);
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
      var auraBuffs = options.match ? clientGetAuraBuffs(id, options.match) : { power: 0, toughness: 0, count: 0 };
      if (auraBuffs.count > 0) {
        var abadge = document.createElement('div');
        abadge.className = 'auraBadge';
        abadge.textContent = '\u2728' + auraBuffs.count;
        wrap.appendChild(abadge);
      }
      wrap.appendChild(img);
      var badge = document.createElement('div');
      badge.className = 'ptBadge';
      var basePw = Number(c?.power) || 0;
      var baseTw = Number(c?.toughness) || 0;
      var buffedPw = basePw + auraBuffs.power;
      var buffedTw = baseTw + auraBuffs.toughness;
      var isBuffed = auraBuffs.power !== 0 || auraBuffs.toughness !== 0;
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
    el.dataset.seat = seat;

    const bar = document.createElement('div');
    bar.className = 'seatBar';
    var critThresh = match.format === 'commander' ? 10 : 5;
    var lifeCritical = life != null && life <= critThresh && life > 0;
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

    const bf = Array.isArray(zones?.battlefield) ? zones.battlefield : [];
    const bfArea = document.createElement('div');
    bfArea.className = 'bfArea';
    // Determine which cards are attacking (from combat state or pending)
    var combatAttackers = match?.game?.combat?.attackers || {};
    // Filter out attached auras — they render as badges on their target creature
    var auraAttachments = match?.game?.auraAttachments || {};
    var visibleBf = bf.filter(function(id) { return !auraAttachments[id]; });
    if (visibleBf.length) {
      for (var bfi = 0; bfi < visibleBf.length; bfi++) {
        var id = visibleBf[bfi];
        var cs = match?.game?.cardState?.[id] || null;
        var isAtk = !!combatAttackers[id] || !!state.pendingAttackers[id];
        var cardEl = renderCardImg(id, { zone: 'battlefield', seat, w: 72, h: 100, lazy: !isViewer, cardState: cs, isAttacking: isAtk, match: match });
        bfArea.appendChild(cardEl);
      }
    } else {
      bfArea.innerHTML = '<div class="emptyZone">No permanents</div>';
    }
    // Apply targeting mode CSS classes
    if (state.targetingMode && visibleBf.length) {
      var tgtCardEls = bfArea.querySelectorAll('.cardWrap');
      for (var tci = 0; tci < tgtCardEls.length; tci++) {
        var tWrap = tgtCardEls[tci];
        var tCid = tWrap.dataset.cardId;
        if (!tCid) continue;
        if (state.targetingMode.validTargets.indexOf(tCid) >= 0) {
          tWrap.classList.add('canTarget');
          if (state.targetingMode.selectedTarget === tCid) tWrap.classList.add('targetSelected');
          (function(capturedId) { tWrap.onclick = function() { handleTargetClick(capturedId); }; })(tCid);
        } else if (clientCardType(tCid) === 'creature') {
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
    el.appendChild(bfArea);

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
      + buttonsHtml
      + '<button id="btnConcede" class="btn" style="color:rgba(239,68,68,0.7);border-color:rgba(239,68,68,0.2);background:transparent;margin-left:auto;">Concede</button>';

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
    var concedeBtn = bar.querySelector('#btnConcede');
    if (concedeBtn) concedeBtn.onclick = concede;
  }

  function renderGame(match) {
    const show = !!match && (match.phase === 'playing' || match.phase === 'finished') && !!match.viewerSeat;
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
    // Clear targeting mode if not in a main phase
    if (step !== 'main1' && step !== 'main2') { state.targetingMode = null; }

    const seats = (match.players || []).map(p => p.seat).sort((a, b) => a - b);
    const oppSeats = seats.filter(s => s !== mySeat);

    const oppEl = $('#oppSide'); oppEl.innerHTML = '';
    const isMulti = oppSeats.length >= 2;
    oppEl.classList.toggle('multi', isMulti);
    for (const seat of oppSeats) {
      oppEl.appendChild(renderBoardSeat(match, seat, false));
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
        if (cb) cb.onclick = function() { confirmTarget(); };
        if (cc) cc.onclick = function() { cancelTargeting(); };
      }, 0);
    }

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

    // Game over overlay
    var existingOverlay = document.querySelector('#gameBoard .gameOverOverlay');
    if (match.game?.status === 'finished') {
      if (!existingOverlay) {
        var overlay = document.createElement('div');
        overlay.className = 'gameOverOverlay';
        var isVictory = match.game.winner === match.viewerSeat;
        var titleEl = document.createElement('div');
        titleEl.className = 'gameOverTitle ' + (isVictory ? 'victory' : 'defeat');
        titleEl.textContent = isVictory ? 'VICTORY' : 'DEFEAT';
        overlay.appendChild(titleEl);

        var myStats = match.game.stats?.[match.viewerSeat] || { damageDealt: 0, creaturesKilled: 0 };
        var myLife = match.game.lifeBySeat?.[match.viewerSeat] || 0;
        var turns = match.game.turn || 0;
        var statsRow = document.createElement('div');
        statsRow.className = 'gameOverStats';
        var statItems = [
          [String(turns), 'Turns'],
          [String(myLife), 'Life'],
          [String(myStats.creaturesKilled || 0), 'Kills'],
          [String(myStats.damageDealt || 0), 'Damage']
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
        btns.appendChild(btnAgain);
        btns.appendChild(btnMenu);
        overlay.appendChild(btns);

        var board = document.getElementById('gameBoard');
        if (board) board.appendChild(overlay);
      }
    } else if (existingOverlay) {
      existingOverlay.remove();
    }
  }

  async function refreshMatch() {
    if (!state.activeMatchId) { $('#matchDebug').textContent = 'No active match.'; renderLobby(null); $('#gamePanel').style.display = 'none'; return; }
    const match = await supExec('api_getMatch', { matchId: state.activeMatchId });
    state.lastMatch = match; await hydrateCardIndexForMatch(match);
    if (!state.lastLogIndex && match?.log?.length && match.phase === 'playing') {
      state.lastLogIndex = match.log.length;
    }
    processAnimationEvents(match);
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
    }
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
    var dmgRe = /deals\s+(\d+)\s+damage\s+to\s+(any target|target creature|target player|target opponent|each opponent)/gi;
    var dm;
    while ((dm = dmgRe.exec(oracleText)) !== null) {
      var tType = dm[2].toLowerCase();
      if (tType === 'target opponent') tType = 'target player';
      effects.push({ type: 'damage', amount: parseInt(dm[1], 10), targetType: tType });
    }
    var destRe = /destroy\s+target\s+(creature|permanent)/gi;
    var de;
    while ((de = destRe.exec(oracleText)) !== null) { effects.push({ type: 'destroy', targetType: de[1].toLowerCase() }); }
    var drawRe = /draw\s+(\w+)\s+cards?/gi;
    var dr;
    var wordToNum = { a: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7 };
    while ((dr = drawRe.exec(oracleText)) !== null) { var n = parseInt(dr[1], 10); if (isNaN(n)) n = wordToNum[dr[1].toLowerCase()] || 1; effects.push({ type: 'draw', amount: n }); }
    var lifeRe = /gain\s+(\d+)\s+life/gi;
    var lr;
    while ((lr = lifeRe.exec(oracleText)) !== null) { effects.push({ type: 'gainLife', amount: parseInt(lr[1], 10) }); }
    var buffRe = /target\s+creature\s+gets\s+([+-]\d+)\/([+-]\d+)\s+until\s+end\s+of\s+turn/gi;
    var br;
    while ((br = buffRe.exec(oracleText)) !== null) { effects.push({ type: 'tempBuff', power: parseInt(br[1], 10), toughness: parseInt(br[2], 10) }); }
    return effects;
  }

  function clientSpellNeedsTarget(effects) {
    for (var i = 0; i < effects.length; i++) {
      var e = effects[i];
      if (e.type === 'damage' && (e.targetType === 'target creature' || e.targetType === 'target player' || e.targetType === 'any target')) return true;
      if (e.type === 'destroy') return true;
      if (e.type === 'tempBuff') return true;
    }
    return false;
  }

  function enterSpellTargetingMode(cardId, effects) {
    var match = state.lastMatch;
    if (!match) return;
    var mySeat = match.viewerSeat;
    var validTargets = [];
    var needsCreature = false; var needsPlayer = false;
    for (var i = 0; i < effects.length; i++) {
      var e = effects[i];
      if (e.type === 'damage') {
        if (e.targetType === 'target creature') needsCreature = true;
        else if (e.targetType === 'target player') needsPlayer = true;
        else if (e.targetType === 'any target') { needsCreature = true; needsPlayer = true; }
      } else if (e.type === 'destroy') { needsCreature = true; }
      else if (e.type === 'tempBuff') { needsCreature = true; }
    }
    if (needsCreature) {
      var creatures = getTargetableCreatures(match, mySeat);
      for (var ci = 0; ci < creatures.length; ci++) validTargets.push(creatures[ci]);
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
    renderGame(match);
  }

  async function playSelectedToBattlefield() {
    const sel = state.selected; if (!state.activeMatchId || !sel?.id) return;
    if (!(sel.zone === 'hand' && sel.seat === state.lastMatch?.viewerSeat)) { toast('Select a card in your hand to play.', { type: 'warn' }); return; }
    // Aura: enter targeting mode instead of playing directly
    if (clientIsAura(sel.id)) {
      enterTargetingMode(sel.id);
      return;
    }
    var isSpell = (clientCardType(sel.id) === 'instant' || clientCardType(sel.id) === 'sorcery');
    // Spell with targeted effects: enter spell targeting mode
    if (isSpell) {
      var oracle = String(cardMeta(sel.id)?.oracleText || '');
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
        game: { turn: 0, activePlayerSeat: 1, prioritySeat: 1, step: "main1", stack: [], zones: {}, lifeBySeat: {}, manaBySeat: {}, mulligansBySeat: {}, keptBySeat: {}, cardState: {}, combat: null, status: "playing", winner: null, losers: [], stats: {} },
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
            const commanderId = match.format === "commander" ? deck.commander : null;
            const library = commanderId ? expanded.filter((id) => id !== commanderId) : expanded.slice();
            shuffleInPlace(library);
            const hand = []; for (let i = 0; i < 7; i++) { const top = library.shift(); if (!top) break; hand.push(top); }
            match.game.zones[seat] = { library, hand, graveyard: [], exile: [], battlefield: [], command: commanderId ? [commanderId] : [] };
            match.game.lifeBySeat[seat] = match.format === "commander" ? 40 : 20;
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
            var spellEffects = engineParseSpellEffects(deckMeta[cardId]?.oracleText);
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
        const ok = enginePlayCard(match, seat, cardId, targetId); if (!ok.ok) return ok;
        mana.current = Math.max(0, mana.current - cmc);
        match.log.push({ t: Date.now(), type: isSpell ? "CAST_SPELL" : "PLAY", by: user.username, seat, cardId, targetId: targetId });
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
        var seat = player.seat; engineEnsureZones(match, seat);
        var drawN = Math.max(1, Math.min(7, Number(action.n) || 1));
        var drawRes = engineDrawCards(match, seat, drawN);
        if (drawRes.deckOut) {
            if (!match.game.losers) match.game.losers = [];
            if (match.game.losers.indexOf(seat) < 0) {
                match.game.losers.push(seat);
                match.log.push({ t: Date.now(), type: "DECK_OUT", seat: seat });
                engineCheckGameOver(match);
            }
        }
        match.log.push({ t: Date.now(), type: "DRAW", by: user.username, n: drawN });
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
        if (match.phase !== "playing") return { ok: false, error: "not in playing phase" };
        if (match.game.step !== "combat_blockers") return { ok: false, error: "not in blocker declaration step" };
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
        if (match.game.losers.indexOf(seat) < 0) match.game.losers.push(seat);
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
    engineEnsureZones(match, next); var drawResult = engineDrawCards(match, next, 1);
    if (drawResult.deckOut) {
        if (!match.game.losers) match.game.losers = [];
        if (match.game.losers.indexOf(next) < 0) {
            match.game.losers.push(next);
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
    // Clear combat state
    match.game.combat = null;
    match.log.push({ t: Date.now(), type: "TURN_START", by: (opts || {}).by || "engine", turn: match.game.turn, seat: next });
}

function engineRunBotsIfActive(match) {
    var guard = 0;
    while (guard++ < 6) {
        if (match.game?.status === "finished") break;
        var botPlayer = (match.players || []).find(function(p) { return p.isBot && p.seat === match.game?.activePlayerSeat; });
        if (!botPlayer) break;
        engineBotTakeTurn(match, botPlayer);
    }
}

function engineGetCreaturePower(match, seat, cardId) {
    var base = Number((match.decks?.[seat]?.cardMeta || {})[cardId]?.power) || 0;
    var auras = match.game?.auraAttachments || {};
    for (var auraId in auras) {
        if (auras[auraId] === cardId) {
            var auraSeat = engineFindSeatForCard(match, auraId);
            if (auraSeat != null) base += engineParseAuraMods(match, auraSeat, auraId).power;
        }
    }
    var buffs = match.game?.tempBuffs || [];
    for (var bi = 0; bi < buffs.length; bi++) { if (buffs[bi].cardId === cardId) base += buffs[bi].power; }
    return base;
}
function engineGetCreatureToughness(match, seat, cardId) {
    var base = Number((match.decks?.[seat]?.cardMeta || {})[cardId]?.toughness) || 0;
    var auras = match.game?.auraAttachments || {};
    for (var auraId in auras) {
        if (auras[auraId] === cardId) {
            var auraSeat = engineFindSeatForCard(match, auraId);
            if (auraSeat != null) base += engineParseAuraMods(match, auraSeat, auraId).toughness;
        }
    }
    var buffs = match.game?.tempBuffs || [];
    for (var bi = 0; bi < buffs.length; bi++) { if (buffs[bi].cardId === cardId) base += buffs[bi].toughness; }
    return base;
}

var SUPPORTED_KEYWORDS = ["Flying","Reach","First Strike","Double Strike","Trample","Deathtouch","Lifelink","Haste","Vigilance","Defender","Menace","Indestructible","Hexproof"];

function engineGetKeywords(match, seat, cardId) {
    var meta = (match.decks?.[seat]?.cardMeta || {})[cardId];
    return (meta && Array.isArray(meta.keywords)) ? meta.keywords : [];
}
function engineHasKeyword(match, seat, cardId, keyword) {
    var kws = engineGetKeywords(match, seat, cardId);
    for (var i = 0; i < kws.length; i++) { if (kws[i] === keyword) return true; }
    return false;
}
// Check keyword on a card that may be in graveyard (for deathtouch source tracking)
function engineHasKeywordAnySeat(match, cardId, keyword) {
    var seats = engineSeatOrder(match);
    for (var i = 0; i < seats.length; i++) {
        var meta = (match.decks?.[seats[i]]?.cardMeta || {})[cardId];
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
    var tl = String((match.decks?.[seat]?.cardMeta || {})[cardId]?.typeLine || "").toLowerCase();
    return tl.includes("enchantment") && tl.includes("aura");
}

function engineParseAuraMods(match, seat, cardId) {
    var meta = (match.decks?.[seat]?.cardMeta || {})[cardId];
    var oracle = String(meta?.oracleText || "");
    var pw = 0; var tw = 0;
    var re = /([+-]\d+)\/([+-]\d+)/g;
    var m;
    while ((m = re.exec(oracle)) !== null) { pw += parseInt(m[1], 10); tw += parseInt(m[2], 10); }
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
                        totalDmgToBlockers += 0; // player damage handled by helper (includes lifelink)
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
            var isLethal = dmg >= tough && tough > 0;
            // Deathtouch: any damage from a Deathtouch source is lethal
            if (!isLethal && dmg > 0 && Array.isArray(cs.damageSourceIds)) {
                for (var di = 0; di < cs.damageSourceIds.length; di++) {
                    if (engineHasKeywordAnySeat(match, cs.damageSourceIds[di], "Deathtouch")) { isLethal = true; break; }
                }
            }
            if (isLethal) {
                // Indestructible: survives lethal damage
                if (engineHasKeyword(match, seat, cid, "Indestructible")) continue;
                engineMoveCard(match, seat, "battlefield", "graveyard", cid);
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
                if (cdMap[cmdId] >= 21) {
                    match.game.losers.push(cs);
                    var clp = (match.players || []).find(function(p) { return p.seat === cs; });
                    match.log.push({ t: Date.now(), type: "PLAYER_ELIMINATED", seat: cs, by: clp ? clp.username : "seat " + cs, reason: "commander_damage" });
                    break;
                }
            }
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
    // "destroy target creature/permanent"
    var destRe = /destroy\s+target\s+(creature|permanent)/gi;
    var de;
    while ((de = destRe.exec(oracleText)) !== null) {
        effects.push({ type: 'destroy', targetType: de[1].toLowerCase() });
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
    var buffRe = /target\s+creature\s+gets\s+([+-]\d+)\/([+-]\d+)\s+until\s+end\s+of\s+turn/gi;
    var br;
    while ((br = buffRe.exec(oracleText)) !== null) {
        effects.push({ type: 'tempBuff', power: parseInt(br[1], 10), toughness: parseInt(br[2], 10) });
    }
    return effects;
}

function engineEffectNeedsTarget(effects) {
    for (var i = 0; i < effects.length; i++) {
        var e = effects[i];
        if (e.type === 'damage' && (e.targetType === 'target creature' || e.targetType === 'target player' || e.targetType === 'any target')) return true;
        if (e.type === 'destroy') return true;
        if (e.type === 'tempBuff') return true;
    }
    return false;
}

function engineApplyEffect(match, casterSeat, effect, targetId) {
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
        }
    }
}

function enginePlayCard(match, seat, cardId, targetId) {
    if (engineIsSpell(match, seat, cardId)) {
        var moveRes = engineMoveCard(match, seat, "hand", "graveyard", cardId);
        if (moveRes.ok) {
            var meta = (match.decks?.[seat]?.cardMeta || {})[cardId];
            var effects = engineParseSpellEffects(meta?.oracleText);
            for (var ei = 0; ei < effects.length; ei++) {
                engineApplyEffect(match, seat, effects[ei], targetId);
            }
            if (effects.length) {
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
    return result;
}

function engineBotTakeTurn(match, botPlayer) {
    if (match.game?.status === "finished") return;
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

    // Helper: find best aura target for bot
    var botAuraTarget = function(cardId) {
        var allSeats = engineSeatOrder(match);
        var bestTarget = null; var bestPower = -1;
        // Prefer own creatures (biggest power)
        var ownBf = match.game.zones?.[seat]?.battlefield || [];
        for (var oi = 0; oi < ownBf.length; oi++) {
            var oid = ownBf[oi];
            if (!engineIsCreature(match, seat, oid)) continue;
            var pw = engineGetCreaturePower(match, seat, oid);
            if (pw > bestPower) { bestPower = pw; bestTarget = oid; }
        }
        // Easy: also consider opponent creatures (random)
        if (!bestTarget && diff === "easy") {
            for (var si = 0; si < allSeats.length; si++) {
                if (allSeats[si] === seat) continue;
                var oBf = match.game.zones?.[allSeats[si]]?.battlefield || [];
                for (var ci = 0; ci < oBf.length; ci++) {
                    if (engineIsCreature(match, allSeats[si], oBf[ci]) && !engineHasKeyword(match, allSeats[si], oBf[ci], "Hexproof")) { return oBf[ci]; }
                }
            }
        }
        return bestTarget;
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
                if (eff.targetType === 'any target') return 'seat:' + allSeats.find(function(s) { return s !== seat; });
            }
            if (eff.type === 'damage' && eff.targetType === 'target player') {
                return 'seat:' + allSeats.find(function(s) { return s !== seat; });
            }
            if (eff.type === 'destroy') {
                // Pick strongest opponent creature
                var bestDest = null; var bestPow = -1;
                for (var si2 = 0; si2 < allSeats.length; si2++) {
                    if (allSeats[si2] === seat) continue;
                    var oBf2 = match.game.zones?.[allSeats[si2]]?.battlefield || [];
                    for (var ci2 = 0; ci2 < oBf2.length; ci2++) {
                        if (!engineIsCreature(match, allSeats[si2], oBf2[ci2])) continue;
                        if (engineHasKeyword(match, allSeats[si2], oBf2[ci2], "Hexproof")) continue;
                        if (engineHasKeyword(match, allSeats[si2], oBf2[ci2], "Indestructible")) continue;
                        var p = engineGetCreaturePower(match, allSeats[si2], oBf2[ci2]);
                        if (p > bestPow) { bestPow = p; bestDest = oBf2[ci2]; }
                    }
                }
                return bestDest;
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
        }
        return null;
    };

    var botPlayCard = function(cardId) {
        if (engineIsAura(match, seat, cardId)) {
            var target = botAuraTarget(cardId);
            if (!target) return false;
            enginePlayCard(match, seat, cardId, target);
        } else if (engineIsSpell(match, seat, cardId)) {
            var spellTarget = botPickSpellTarget(cardId);
            var meta = engineBotCardMeta(match, seat, cardId);
            var effects = engineParseSpellEffects(meta?.oracleText);
            if (engineEffectNeedsTarget(effects) && !spellTarget) return false; // no valid target
            enginePlayCard(match, seat, cardId, spellTarget);
        } else {
            enginePlayCard(match, seat, cardId);
        }
        return true;
    };

    if (diff === "easy") {
        // Easy: play 1 random affordable card
        const idx = sup.random.integer(0, affordable.length - 1);
        const cardId = affordable[idx];
        if (botPlayCard(cardId)) {
            mana.current = Math.max(0, mana.current - getCmc(cardId));
            played.push(cardId);
        }
    } else if (diff === "medium") {
        // Medium: sort affordable by CMC ascending, play greedily (cheapest first)
        const sorted = affordable.slice().sort((a, b) => getCmc(a) - getCmc(b));
        for (const cardId of sorted) {
            if (getCmc(cardId) > mana.current) continue;
            if (botPlayCard(cardId)) {
                mana.current = Math.max(0, mana.current - getCmc(cardId));
                played.push(cardId);
            }
        }
    } else {
        // Hard: sort affordable by CMC descending (value maximization), cap board at 6
        const sorted = affordable.slice().sort((a, b) => getCmc(b) - getCmc(a));
        for (const cardId of sorted) {
            if (getCmc(cardId) > mana.current) continue;
            if (bf.length + played.length >= 6) break;
            if (botPlayCard(cardId)) {
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
    if (match.game?.status !== "finished") engineAdvanceTurn(match, { by: "bot" });
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
            if (engineHasKeyword(match, seat, eid, "Vigilance")) atkScore += 1;
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
    match.log.push({ t: Date.now(), type: "ATTACKERS_DECLARED", by: "bot", seat: seat, count: chosen.length });
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
        // Medium: only block if our creature kills the attacker, skip Menace
        for (var ai = 0; ai < incomingAttackers.length; ai++) {
            var atkId = incomingAttackers[ai];
            if (hasMenace(atkId)) continue; // Medium skips Menace
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
    return { id: card.id, name: card.name, typeLine: card.type_line, manaCost: card.mana_cost, oracleText: card.oracle_text, imageSmall, imageNormal, legalities: card.legalities, cmc: card.cmc, colors: card.colors, colorIdentity: card.color_identity, set: card.set, collectorNumber: card.collector_number, power: card.power != null ? String(card.power) : null, toughness: card.toughness != null ? String(card.toughness) : null, keywords: Array.isArray(card.keywords) ? card.keywords : [], oracleText: card.oracle_text || '' };
}
