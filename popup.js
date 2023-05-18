const copyElement = document.getElementById('copy');
const successElement = document.getElementById('success');

// The async IIFE is necessary because Chrome <89 does not support top level await.
(async function initPopupWindow() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab?.url) {
    copyElement.addEventListener("click", async (event)=>{
      event.preventDefault();

      let url = new URL(tab.url);

      const cookies = await chrome.cookies.getAll({ domain: url.hostname });


      let pending = cookies.map(setCookie);
      await Promise.all(pending);
      const span = document.createElement("span")
      span.textContent = "Now you can go to localhost and reload it";
      span.style.padding = "0 10px";
      successElement.appendChild(span);
      successElement.style.display = "flex";
      // navigator.clipboard.writeText(cookies);
    })
  }

  function setCookie(cookie) {
    // Cookie deletion is largely modeled off of how deleting cookies works when using HTTP headers.
    // Specific flags on the cookie object like `secure` or `hostOnly` are not exposed for deletion
    // purposes. Instead, cookies are deleted by URL, name, and storeId. Unlike HTTP headers, though,
    // we don't have to delete cookies by setting Max-Age=0; we have a method for that ;)
    //
    // To remove cookies set with a Secure attribute, we must provide the correct protocol in the
    // details object's `url` property.
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#Secure
  
    // Note that the final URL may not be valid. The domain value for a standard cookie is prefixed
    // with a period (invalid) while cookies that are set to `cookie.hostOnly == true` do not have
    // this prefix (valid).
    // https://developer.chrome.com/docs/extensions/reference/cookies/#type-Cookie
          return chrome.cookies.set({
            url: "https://localhost/",
            name: cookie.name,
            value: cookie.value,
            path: "/",
            secure: false,
            httpOnly: false
          }); 
  }
})();


