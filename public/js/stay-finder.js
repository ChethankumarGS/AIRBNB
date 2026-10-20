(() => {
  const form=document.getElementById('ai-stay-form');
  if (!form) return;
  const prompt=document.getElementById('trip-prompt');
  const button=document.getElementById('ai-submit');
  prompt.addEventListener('input',()=>{document.getElementById('prompt-count').textContent=`${prompt.value.length} / 500`;});
  form.addEventListener('submit',()=>{
    button.disabled=true;
    button.textContent='Reading your request...';
    form.setAttribute('aria-busy','true');
    document.getElementById('ai-progress').textContent='This may take up to 10 seconds. Your search will open next.';
  });
  window.addEventListener('pageshow',()=>{button.disabled=false;button.textContent='Find my stays';form.removeAttribute('aria-busy');document.getElementById('ai-progress').textContent='';});
})();
