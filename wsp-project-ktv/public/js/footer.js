let footerElem = document.querySelector('#footer')
if (footerElem){
  let pagePath = window.location.pathname
  let activeTabIndex = pagePath.substring(
    pagePath.indexOf("page") + 4, 
    pagePath.lastIndexOf(".html")
);

    footerElem.innerHTML = `
    <footer>
        <a href="/page1.html" class="footer-control"><i class="fa-solid fa-house"></i></a>
        <a href="/page2.html" class="footer-control"><i class="fa-solid fa-chalkboard"></i></a>
        <a href="/page3.html" class="footer-control"><i class="fa-solid fa-message"></i></a>

        
        <a id="footer-login" href="./login/login.html" class="footer-control">
        <span id='footer-profile-img-container'>
            <i class="fa-solid fa-user"></i>
        </span>
          
        </a>
    </footer>
    `
    let footerButtonElems  =  document.querySelectorAll('a.footer-control')
    console.log('footerButtonElems = ', footerButtonElems)
    if (footerButtonElems[activeTabIndex - 1]){
        footerButtonElems[activeTabIndex - 1].classList.add('active')

    }

}




