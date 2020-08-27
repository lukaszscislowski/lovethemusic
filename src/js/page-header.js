function stickyHeader() {
    const pageHeader = document.querySelector('.page-header');

    if (this.pageYOffset >= 100) {
        pageHeader.classList.add('sticky');
    } else {
        pageHeader.classList.remove('sticky');
    }
}

function pageHeaderSticky() {
    const media = window.matchMedia("(max-width: 760px)");

    if (media.matches) {
        window.removeEventListener('scroll', stickyHeader);
    } else {
        window.addEventListener('scroll', stickyHeader);
    }

    media.addListener(function(media) {
        if (media.matches) {
            window.removeEventListener('scroll', stickyHeader);
        } else {
            window.addEventListener('scroll', stickyHeader);
        }
    });
}






export { pageHeaderSticky }