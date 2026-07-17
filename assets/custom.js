  if (!customElements.get("custom-accordion")) {
  customElements.define(
    "custom-accordion",
    class CustomAccordion extends HTMLElement {
      constructor() {
        super();
 
        this.isFaq = this.querySelector(".faq-item");
        this.isBlog = this.querySelector(".blog-category-item");

        if (this.isFaq) {
          this.item = this.querySelector(".faq-item");
          this.panel = this.querySelector(".faq-item-content");
          this.trigger = this.item; 
        }

        if (this.isBlog) {
          this.item = this.querySelector(".blog-category-item");
          this.panel = this.querySelector(".blog-subcategory-list");
          this.trigger = this.querySelector(".blog-category-toggle");
        }
      }

      connectedCallback() {
        if (!this.item || !this.panel || !this.trigger) return;

        if (this.item.classList.contains("is-open")) {
          this.panel.style.height = this.panel.scrollHeight + "px";
        }

        this.trigger.addEventListener("click", (e) => {
          e.preventDefault();
          this.toggle();
        });
      }

      toggle() {
        this.item.classList.contains("is-open")
          ? this.close()
          : this.open();
      }

      open() {
        this.item.classList.add("is-open");
        this.panel.style.height = "0px";

        requestAnimationFrame(() => {
          this.panel.style.height = this.panel.scrollHeight + "px";
        });
      }

      close() {
        this.panel.style.height = this.panel.scrollHeight + "px";
        this.item.classList.remove("is-open");

        requestAnimationFrame(() => {
          this.panel.style.height = "0px";
        });
      }
    }
  );
}



var thumbsSwiper = new Swiper(".mySwiper", {
  loop: true,
  spaceBetween: 10,
  slidesPerView: 8,
  freeMode: true,
  watchSlidesProgress: true,

  breakpoints: {
    0: {
      slidesPerView: 4,
    },
    768: {
      slidesPerView: 5,
    },
    1024: {
      slidesPerView: 8,
    },
  },
});


window.productSwiper = new Swiper('.product__swiper', {
  loop: true,
  spaceBetween: 8,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  thumbs: {
    swiper: thumbsSwiper,
  },
});


      