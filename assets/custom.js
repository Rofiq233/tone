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




document.addEventListener("DOMContentLoaded", () => {
  upselProduct();
});





if (!customElements.get("upsel-product")) {
  customElements.define(
    "upsel-product",
    class CustomAccordion extends HTMLElement {

      constructor() {
        super();
      }
      connectedCallback() {
        this.form = this.querySelector("form");
        this.btn = this.form.querySelector(".product-form__submit");
        this.btn.addEventListener("click", this.handleclick.bind(this));
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        // this.cart_image =  this.querySelector(".cart_drawer-upsel_image");
        this.cart_image = this.closest(".cart_drawer-upsel_image");



      }

      async handleclick(e) {
        e.preventDefault();
        if (!this.form) return;
        this.cart_image.classList.add("add_process_product");

        const formData = new FormData(this.form);

        if (this.cart) {
          formData.append(
            'sections',
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append('sections_url', window.location.pathname);
        }
        const config = {
          method: "POST",
          body: formData,
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
        }
        fetch("/cart/add.js", config)
          .then(res => res.json())
          .then(data => {

            this.cart.renderContents(data);
            this.cart_image.classList.remove("add_process_product");
            requestAnimationFrame(() => {
              upselProduct();
            });
          }).catch((e) => {
            this.cart_image.classList.remove("add_process_product");
          }).finally(() => {
            this.cart_image.classList.remove("add_process_product");
          })

      }

    }

  )
}







// Money format handler
Shopify.money_format = "${{amount_no_decimals}}";
Shopify.formatMoney = function (cents, format) {
  if (typeof cents == 'string') cents = cents.replace('.', '');
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = (format || this.money_format);

  function defaultOption(opt, def) {
    return (typeof opt === 'undefined' ? def : opt);
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ',');
    decimal = defaultOption(decimal, '.');

    if (isNaN(number) || number == null) return 0;
    number = (number / 100.0).toFixed(precision);
    var parts = number.split('.'),
      dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
      cents = parts[1] ? (decimal + parts[1]) : '';
    return dollars + cents;
  }

  var match = formatString.match(placeholderRegex);
  if (!match) return formatString;

  switch (match[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
  }

  return formatString.replace(placeholderRegex, value);
};








class ShippingBar extends HTMLElement {
  constructor() {
    super();

    this.currentCurrency = Shopify.currency.active;
    this.conversionRate = Shopify.currency.rate;
    this.threshold = Number(this.dataset.threshold);
    this.totalPrice = Number(this.dataset.totalPrice);
    this.moneyFormat = this.dataset.moneyFormat;
    this.empty = this.dataset.empty === "true";
    this.showCurrencyCode = this.dataset.showCurrencyCode === "true";
  }

  connectedCallback() {
    this.calculateConvertedPrices();

    if (this.empty) {
      this.emptyText = this.querySelector("[data-empty-text]");
      this.showEmptyText();
      return;
    }

    this.successText = this.querySelector("[data-success-text]");
    this.progressText = this.querySelector("[data-progress-text]");
    this.progressBar = this.querySelector("[data-progress-bar]");

    this.showProgress();
  }

  showEmptyText() {
    this.emptyText.innerHTML = this.emptyText.innerHTML.replace(
      "[amount]",
      this.getFormattedPrice(this.threshold)
    );

    this.emptyText.classList.remove("hidden");
  }

  calculateConvertedPrices() {
    this.threshold = Number(
      (this.threshold * (this.conversionRate || 1)).toFixed(0)
    );
  }

  showProgress() {
    const progressPercent = Math.min(
      (this.totalPrice * 100) / this.threshold,
      100
    );

    this.progressBar.style.width = `${progressPercent}%`;

    this.progressBar.parentElement.style.setProperty(
      "--width",
      `${progressPercent}%`
    );

    this.progressBar.parentElement.classList.remove("hidden");

    // Goal Completed
    if (this.totalPrice >= this.threshold) {
      this.progressText.classList.add("hidden");
      this.successText.classList.remove("hidden");
      return;
    }

    // Remaining Amount
    const remain = this.threshold - this.totalPrice;

    this.progressText.innerHTML = this.progressText.innerHTML.replace(
      "[amount]",
      this.getFormattedPrice(remain)
    );

    this.progressText.classList.remove("hidden");
    this.successText.classList.add("hidden");
  }

  getFormattedPrice(price) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: this.currentCurrency,
    }).format(price / 100);
  }
}

customElements.define("shipping-bar", ShippingBar);

// class ShippingBar extends HTMLElement {
//   constructor() {
//     super();
//     this.currentCurrency = Shopify.currency.active;
//     this.conversionRate = Shopify.currency.rate;
//     this.threshold = this.dataset.threshold;
//     this.convertedThreshold = 0;
//     this.totalPrice = this.dataset.totalPrice;
//     this.moneyFormat = this.dataset.moneyFormat;
//     this.empty = this.dataset.empty === 'true';
//     this.showCurrencyCode = this.dataset.showCurrencyCode === 'true';
//   }

//   connectedCallback() {
//     this.calculateConvertedPrices();
//     if (this.empty) {
//       this.emptyText = this.querySelector('[data-empty-text]');
//       this.showEmptyText();
//       return;
//     }
//     this.successText = this.querySelector('[data-success-text]');
//     this.progressText = this.querySelector('[data-progress-text]');
//     this.progressBar = this.querySelector('[data-progress-bar]');

//     const thresholdIsPassed = Number(this.totalPrice) > Number(this.threshold);
//     if (!thresholdIsPassed && Number(this.threshold) > 0) {
//       this.showProgress();
//       return;
//     }
//     this.progressBar.style.width = '100%';
//     this.progressBar.parentElement.style.setProperty('--width', `100%`);

//     this.progressBar.parentElement.classList.remove('hidden');
//     this.successText.classList.remove('hidden');
//   }

//   showEmptyText() {
//     this.emptyText.innerHTML = this.emptyText.innerHTML.replace(
//       '[amount]',
//       this.getFormattedPrice(this.threshold)
//     );
//     this.emptyText.classList.remove('hidden');
//   }

//   calculateConvertedPrices() {

    
//     this.threshold = (this.threshold * (this.conversionRate || 1)).toFixed(0);
//     console.log(this.threshold);
//   }

//   showProgress() {
//     // Calculate progress percent
//     const progressPercent = (this.totalPrice * 100) / this.threshold;
//     this.progressBar.style.width = `${progressPercent}%`;
//     this.progressBar.parentElement.style.setProperty('--width', `${progressPercent}%`);
//     // Replace price


//     const progressText = this.progressText.innerHTML.replace('[amount]',this.getFormattedPrice(this.threshold - this.totalPrice));
//     this.progressText.innerHTML = progressText;

//     this.progressBar.parentElement.classList.remove('hidden');
//     this.progressText.classList.remove('hidden');
//   }





//   getFormattedPrice(price) {
//     const formattedPrice = Shopify.formatMoney(price,this.moneyFormat);
//     return this.showCurrencyCode
//       ? `${formattedPrice} ${this.currentCurrency}`
//       : formattedPrice;
//   }
// }

// customElements.define('shipping-bar', ShippingBar);