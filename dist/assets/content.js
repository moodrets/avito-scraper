let t=null;const i={profileName:".Sidebar-root-h24MJ .desktop-1r4tu1s",profileReviewsCount:".Sidebar-root-h24MJ .desktop-fgq05w",profileRating:'.Sidebar-root-h24MJ [data-marker="profile/score"]',profileSubscribers:'.Sidebar-root-h24MJ [data-marker="favorite-seller-counters"]',profileAsideInfoItems:".Sidebar-root-h24MJ .ProfileBadge-root-bcR8G",reviewsItem:".style-snippet-E6g8Y",reviewsItemProductName:".desktop-35wlrd",reviewsItemDateDelivery:".desktop-11ffzh3",reviewsItemRatingStars:".RatingStars-root-Edhhx .Attributes-yellow-star-PY9XT",reviewsMoreLoadButton:'[data-marker="rating-list/moreReviewsButton"]',reviewsSummaryButton:'[data-marker="profile/summary"]',reviewsModal:'[data-marker="profile-rating-detailed/popup"]',reviewsModalScroller:".desktop-y382as",reviewsModalScrollerInner:".style-root-qXsDs",reviewsMoreLoadErrorButton:'[data-marker="errorMessage/button"]'};async function d(r){await chrome.runtime.sendMessage(r)}async function m(r){return new Promise(e=>{setTimeout(()=>{e(!0)},r)})}function p(){window.scrollTo({left:0,top:document.body.scrollHeight,behavior:"smooth"})}function f(r,e){r.scrollTo({top:e,behavior:"smooth"})}async function g(r){let e=document.querySelector(i.profileName),a=document.querySelector(i.profileReviewsCount),o=document.querySelector(i.profileRating),s=document.querySelector(i.profileSubscribers),n=[...document.querySelectorAll(i.profileAsideInfoItems)].find(c=>{var u;return(u=c.textContent)==null?void 0:u.includes("продаж")}),w=s!=null&&s.textContent?s.textContent.split(",")[0]:null,l={parsingDate:Date.now(),name:(e==null?void 0:e.textContent)||"Информация не найдена",rating:(o==null?void 0:o.textContent)||"Информация не найдена",reviewsCount:(a==null?void 0:a.textContent)||"Информация не найдена",subscribers:w||"Информация не найдена",deliveryInfo:(n==null?void 0:n.textContent)||"Информация не найдена",url:r.profileLink};await d({toastType:"success",toastText:"Получена информация профиля",profileInform:l})}const y={parsingEnded:!1,makeMonthNumberFromText(r){let e="";switch(r){case"января":e="01";break;case"февраля":e="02";break;case"марта":e="03";break;case"апреля":e="04";break;case"мая":e="05";break;case"июня":e="06";break;case"июля":e="07";break;case"августа":e="08";break;case"сентября":e="09";break;case"октября":e="10";break;case"ноября":e="11";break;case"декабря":e="12";break}return e},makeDateFromReviewString(r){if(r.trim()==="сегодня")return Date.now();if(r.trim()==="вчера")return new Date().setDate(new Date().getDate()-1);let e=r.split(" "),a=e[0],o=this.makeMonthNumberFromText(e[1]),s=e[2]||`${new Date().getFullYear()}`;return Date.parse(`${s} ${o} ${a}`)},makeDateFromFilterString(r){let e=r.split("."),a=e[0],o=e[1],s=e[2];return Date.parse(`${s} ${o} ${a}`)},get loadMoreButton(){return document.querySelector(i.reviewsMoreLoadButton)},get summaryButton(){return document.querySelector(i.reviewsSummaryButton)},get modal(){return document.querySelector(i.reviewsModal)},getFilteredList(r){let e=[...r];return t!=null&&t.dateFrom&&(t!=null&&t.dateTo)&&(e=e.filter(a=>{if(t!=null&&t.dateFrom&&(t!=null&&t.dateTo)&&a.date>=this.makeDateFromFilterString(t.dateFrom)&&a.date<=this.makeDateFromFilterString(t.dateTo))return a})),t!=null&&t.ratingFrom&&(t!=null&&t.ratingTo)&&(e=e.filter(a=>{if(t!=null&&t.ratingFrom&&(t!=null&&t.ratingTo)&&a.rating>=(t==null?void 0:t.ratingFrom)&&a.rating<=(t==null?void 0:t.ratingTo))return a})),t!=null&&t.productName&&(e=e.filter(a=>{let o=a.productName.toLowerCase(),s=t.productName.toLowerCase();if(o.includes(s))return a})),t!=null&&t.deliveryOnly&&(e=e.filter(a=>a.delivery)),e},async parseItems(){let r=[],e=[...document.querySelectorAll(i.reviewsItem)];if(!e.length){await d({action:"reviews-parsing-ended",toastType:"error",toastText:"Отзывы не найдены"});return}for(const a of e){let o=a.querySelectorAll(i.reviewsItemRatingStars),s=a.querySelector(i.reviewsItemProductName),n=a.querySelector(i.reviewsItemDateDelivery),w=null,l=null,c=null;if(n!=null&&n.textContent&&(l=(n==null?void 0:n.textContent.split(",")[0])||null,w=(n==null?void 0:n.textContent.split(",")[1])||null),l&&(c=this.makeDateFromReviewString(l)),!l||!c){await d({action:"reviews-parsing-ended",toastType:"error",toastText:"Не найдены селекторы в отзывах"});break}let u={date:c||0,dateText:l||"Информация не найдена",delivery:!!w,productName:(s==null?void 0:s.textContent)||"Информация не найдена",rating:(o==null?void 0:o.length)||0};if(r.push(u),t!=null&&t.dateFrom&&u.date<=this.makeDateFromFilterString(t==null?void 0:t.dateFrom)){this.parsingEnded=!0;break}}if(this.parsingEnded){const a=this.getFilteredList(r);await d({action:"reviews-parsing-ended",toastType:"success",toastText:"Парсинг отзывов завершен",reviewsFilteredList:a}),window.close()}else r=[],this.modal?this.loadMoreInModal():this.loadMoreOnPage()},async loadMoreInModal(){var a,o;const r=(a=this.modal)==null?void 0:a.querySelector(i.reviewsModalScroller),e=(o=this.modal)==null?void 0:o.querySelector(i.reviewsModalScrollerInner);(!r||!e)&&await d({action:"reviews-parsing-ended",toastType:"error",toastText:"Не найден селектор для скрола в модалке"}),r&&e&&(f(r,e.clientHeight),await m(2e3),this.parseItems())},async loadMoreOnPage(){p(),await m(2e3),this.loadMoreButton&&this.loadMoreButton.click(),await m(3e3),this.parseItems()},async parsingStart(){var r;await d({action:"reviews-parsing-started",toastType:"success",toastText:"Парсинг отзывов запущен"}),await m(1e3),(r=this.summaryButton)==null||r.click(),await m(3e3),this.parseItems()}};chrome.runtime.onMessage.addListener(async({action:r,filterFields:e})=>{if(!e){await d({toastType:"success",toastText:"Страница не получила поля фильтра"});return}r==="reviews-parsing-start"&&e&&(t=e,t&&g(t),y.parsingStart())});
