/**
 * GET /widget.js — the embeddable referral hub SDK.
 *
 * A business drops one script tag into their app:
 *   <script src="https://app.referlift.dev/widget.js"
 *           data-campaign="cmp_123" data-email="user@acme.com"></script>
 * It calls POST /api/referrals (with a publishable key) and renders a compact
 * "Refer & earn" launcher. This returns a self-contained, dependency-free script.
 */
export async function GET() {
  const js = `(function () {
  var s = document.currentScript;
  var base = new URL(s.src).origin;
  var campaign = s.getAttribute('data-campaign');
  var email = s.getAttribute('data-email');
  var name = s.getAttribute('data-name') || '';
  var key = s.getAttribute('data-key') || '';
  if (!campaign || !email) { console.warn('[referlift] data-campaign and data-email are required'); return; }

  var btn = document.createElement('button');
  btn.textContent = '🎁 Refer & earn';
  btn.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:99999;border:0;border-radius:14px;padding:12px 18px;font:600 14px system-ui;color:#fff;background:linear-gradient(135deg,#7c5cff,#19c3f5);box-shadow:0 12px 30px -10px rgba(124,92,255,.6);cursor:pointer';
  document.body.appendChild(btn);

  btn.addEventListener('click', function () {
    btn.disabled = true; btn.textContent = 'Generating…';
    fetch(base + '/api/referrals', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + key },
      body: JSON.stringify({ campaignId: campaign, user: { email: email, name: name } })
    }).then(function (r) { return r.json(); }).then(function (d) {
      btn.disabled = false; btn.textContent = '🎁 Refer & earn';
      if (!d.shortLink) { alert('Could not generate link'); return; }
      var modal = document.createElement('div');
      modal.style.cssText = 'position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(8,8,20,.55);backdrop-filter:blur(4px)';
      modal.innerHTML = '<div style="background:#fff;color:#11131a;max-width:360px;width:90%;padding:24px;border-radius:20px;font:14px system-ui;text-align:center;box-shadow:0 30px 80px -20px rgba(0,0,0,.5)">'
        + '<img src="' + d.qr + '" width="180" style="border-radius:12px"/>'
        + '<p style="font-weight:700;margin:14px 0 6px">Share your link</p>'
        + '<input value="' + d.shortLink + '" readonly style="width:100%;padding:10px;border:1px solid #e5e7eb;border-radius:10px;text-align:center"/>'
        + '<button id="rl-copy" style="margin-top:12px;width:100%;padding:11px;border:0;border-radius:12px;color:#fff;background:linear-gradient(135deg,#7c5cff,#19c3f5);font-weight:600;cursor:pointer">Copy link</button>'
        + '</div>';
      modal.addEventListener('click', function (e) { if (e.target === modal) modal.remove(); });
      document.body.appendChild(modal);
      document.getElementById('rl-copy').addEventListener('click', function () {
        navigator.clipboard.writeText(d.shortLink); this.textContent = 'Copied!';
      });
    }).catch(function () { btn.disabled = false; btn.textContent = '🎁 Refer & earn'; });
  });
})();`;

  return new Response(js, {
    headers: {
      'content-type': 'application/javascript; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
