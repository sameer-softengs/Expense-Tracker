(function(){
  const path=location.pathname;
  const isAuthPage=/\/auth(?:\.html)?$/.test(path);
  const isPrivate=/\/app(?:\.html)?$/.test(path);
  const pageTitles={
    "/":"Valuebox — Feel good about your money",
    "/index.html":"Valuebox — Feel good about your money",
    "/faq.html":"Valuebox FAQ — Muhammad Sameer",
    "/tutorial.html":"How Valuebox works — Muhammad Sameer",
    "/auth.html":"Sign in to Valuebox",
    "/app.html":"Valuebox expense dashboard"
  };
  const description="Valuebox is a calm, visual expense tracker created by Muhammad Sameer, also known online as sameer-softengs.";
  document.title=pageTitles[path]||pageTitles["/"];
  function meta(name,content,property){
    const attr=property?"property":"name";
    let node=document.head.querySelector(`[${attr}="${name}"]`);
    if(!node){node=document.createElement("meta");node.setAttribute(attr,name);document.head.append(node)}
    node.setAttribute("content",content);
  }
  meta("description",description);
  meta("author","Muhammad Sameer");
  meta("creator","sameer-softengs");
  meta("robots",isPrivate?"noindex,nofollow":"index,follow");
  meta("og:site_name","Valuebox",true);
  meta("og:title",document.title,true);
  meta("og:description",description,true);
  meta("twitter:card","summary");
  meta("twitter:title",document.title);
  meta("twitter:description",description);
  let canonical=document.head.querySelector('link[rel="canonical"]');
  if(!canonical){canonical=document.createElement("link");canonical.rel="canonical";document.head.append(canonical)}
  canonical.href=new URL(path,location.origin).href;
  const schema=document.createElement("script");schema.type="application/ld+json";schema.textContent=JSON.stringify({"@context":"https://schema.org","@type":"WebApplication",name:"Valuebox",url:new URL("/",location.origin).href,description,applicationCategory:"FinanceApplication",operatingSystem:"Web",creator:{"@type":"Person",name:"Muhammad Sameer",alternateName:"sameer-softengs",url:"https://github.com/sameer-softengs"}});document.head.append(schema);
  const configFile="clerk-config.js";
  let clerk;
  const load=(src,attributes={})=>new Promise((resolve,reject)=>{const tag=document.createElement("script");tag.src=src;tag.crossOrigin="anonymous";Object.entries(attributes).forEach(([name,value])=>tag.setAttribute(name,value));tag.onload=resolve;tag.onerror=()=>reject(new Error(`Unable to load ${src}`));document.head.append(tag)});
  function showError(message){const note=document.querySelector("#auth-setup"),mount=document.querySelector("#clerk-auth");if(note){note.innerHTML=message;note.hidden=false}if(mount){mount.innerHTML=`<p class="clerk-error">${message}</p>`}}
  async function initClerk(){
    try{
      await load(configFile);
      const key=window.VALUEBOX_CLERK?.publishableKey;
      if(!key)throw new Error("Missing Clerk publishable key");
      const domain=atob(key.split("_")[2]).slice(0,-1);
      await load(`https://${domain}/npm/@clerk/ui@1/dist/ui.browser.js`);
      await load(`https://${domain}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`,{"data-clerk-publishable-key":key});
      if(!window.Clerk)throw new Error("ClerkJS did not expose window.Clerk");
      clerk=window.Clerk;
      await clerk.load({ui:{ClerkUI:window.__internal_ClerkUICtor}});
      return clerk;
    }catch(error){
      console.error("Clerk failed to initialize",error);
      const key=window.VALUEBOX_CLERK?.publishableKey;
      const domain=key?atob(key.split("_")[2]).slice(0,-1):"";
      const returnUrl=encodeURIComponent(location.origin+"/app.html");
      showError(`Clerk could not load. <a href="https://${domain}/sign-in?redirect_url=${returnUrl}">Continue to secure Clerk sign in ↗</a>`);
      return null;
    }
  }
  async function mountAuth(){const mount=document.querySelector("#clerk-auth");if(!mount)return;const service=await initClerk();if(!service)return;try{service.mountSignIn(mount,{appearance:{variables:{colorPrimary:"#20221f",colorText:"#20221f",borderRadius:"10px"}},afterSignInUrl:new URLSearchParams(location.search).get("next")||"app.html",afterSignUpUrl:"app.html"})}catch(error){console.error("Clerk sign-in mount failed",error);showError("Clerk loaded, but the sign-in component could not mount. Please use the secure Clerk sign-in link above.")}}
  function addUserButton(){const host=document.querySelector(".topbar-actions");if(!host||host.querySelector(".clerk-user-button"))return;const mount=document.createElement("div");mount.className="clerk-user-button";host.append(mount);clerk.mountUserButton(mount)}
  function updateLinks(){document.querySelectorAll("[data-auth-link]").forEach(link=>{if(clerk.isSignedIn){link.href="app.html";link.innerHTML="Open dashboard <span>↗</span>"}})}
  async function protect(){const service=await initClerk();if(!service)return;if(isPrivate&&!clerk.isSignedIn){location.href="auth.html?next=app.html";return}if(isAuthPage&&clerk.isSignedIn){location.href=new URLSearchParams(location.search).get("next")||"app.html";return}if(clerk.isSignedIn){addUserButton();updateLinks()}}
  const revealItems=document.querySelectorAll(".feature-section,.quote-section,.cta-section,.tutorial-steps,.faq-layout,.mini-cta,.tutorial-end");
  if(revealItems.length){revealItems.forEach(item=>item.classList.add("reveal-on-scroll"));if("IntersectionObserver" in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target)}}),{threshold:.12});revealItems.forEach(item=>observer.observe(item))}else revealItems.forEach(item=>item.classList.add("is-visible"))}
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){node.nodeValue=node.nodeValue.replace(/Northstar/g,"Valuebox").replace(/northstar/g,"valuebox").replace(/Supabase/g,"Clerk").replace(/supabase-config\.js/g,"clerk-config.js")}
  (async()=>{if(isAuthPage)await mountAuth();else await protect()})();
})();
