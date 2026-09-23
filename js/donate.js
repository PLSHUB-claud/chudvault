/**
 * RETRO DONATE PAGE LOGIC
 */
document.addEventListener('DOMContentLoaded', () => {
  const addr = "bc1qdhvekhnhwl70wf0gzc8fgl8mxnxgng5um0fqvu";
  const btn = document.getElementById('btnCopy');
  const toast = document.getElementById('toast');
  const btnText = document.getElementById('btnCopyText');

  if (btn) {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(addr).then(() => {
        if (btnText) btnText.textContent = "COPIADO!";
        if (toast) toast.style.display = 'block';
        setTimeout(() => {
          if (btnText) btnText.textContent = "COPIAR";
          if (toast) toast.style.display = 'none';
        }, 2200);
      }).catch(() => {
        alert("Endereço: " + addr);
      });
    });
  }
});
