let t=null,l="";const s={profileName:".Sidebar-root-h24MJ .desktop-1r4tu1s",profileReviewsCount:".Sidebar-root-h24MJ .desktop-fgq05w",profileRating:'.Sidebar-root-h24MJ [data-marker="profile/score"]',profileSubscribers:'.Sidebar-root-h24MJ [data-marker="favorite-seller-counters"]',profileAsideInfoItems:".Sidebar-root-h24MJ .ProfileBadge-root-bcR8G",reviewsItem:".style-snippet-E6g8Y",reviewsItemProductName:".desktop-35wlrd",reviewsItemDateDelivery:".desktop-11ffzh3",reviewsItemRatingStars:".RatingStars-root-Edhhx .Attributes-yellow-star-PY9XT",reviewsMoreLoadButton:'[data-marker="rating-list/moreReviewsButton"]',reviewsSummaryButton:'[data-marker="profile/summary"]',reviewsModal:'[data-marker="profile-rating-detailed/popup"]',reviewsModalScroller:".desktop-y382as",reviewsModalScrollerInner:".style-root-qXsDs",reviewsMoreLoadErrorButton:'[data-marker="errorMessage/button"]'};async function c(r){await chrome.runtime.sendMessage(r)}async function m(r){return new Promise(e=>{setTimeout(()=>{e(!0)},r)})}function f(){window.scrollTo({left:0,top:document.body.scrollHeight,behavior:"smooth"})}function p(r,e){r.scrollTo({top:e,behavior:"smooth"})}async function h(){let r=document.querySelector(s.profileName),e=document.querySelector(s.profileReviewsCount),a=document.querySelector(s.profileRating),o=document.querySelector(s.profileSubscribers),i=[...document.querySelectorAll(s.profileAsideInfoItems)].find(u=>{var d;return(d=u.textContent)==null?void 0:d.includes("продаж")}),n=o!=null&&o.textContent?o.textContent.split(",")[0]:null,w={parsingDate:Date.now(),name:(r==null?void 0:r.textContent)||"Информация не найдена",rating:(a==null?void 0:a.textContent)||"Информация не найдена",reviewsCount:(e==null?void 0:e.textContent)||"Информация не найдена",subscribers:n||"Информация не найдена",deliveryInfo:(i==null?void 0:i.textContent)||"Информация не найдена",url:l};await c({action:"profile-info",status:"success",currentUrl:l,messsage:"Получена информация профиля",data:w})}const v={parsingEnded:!1,makeMonthNumberFromText(r){let e="";switch(r){case"января":e="01";break;case"февраля":e="02";break;case"марта":e="03";break;case"апреля":e="04";break;case"мая":e="05";break;case"июня":e="06";break;case"июля":e="07";break;case"августа":e="08";break;case"сентября":e="09";break;case"октября":e="10";break;case"ноября":e="11";break;case"декабря":e="12";break}return e},makeDateFromReviewString(r){if(r.trim()==="сегодня")return Date.now();if(r.trim()==="вчера")return new Date().setDate(new Date().getDate()-1);let e=r.split(" "),a=e[0],o=this.makeMonthNumberFromText(e[1]),i=e[2]||`${new Date().getFullYear()}`;return Date.parse(`${i} ${o} ${a}`)},makeDateFromFilterString(r){let e=r.split("."),a=e[0],o=e[1],i=e[2];return Date.parse(`${i} ${o} ${a}`)},get loadMoreButton(){return document.querySelector(s.reviewsMoreLoadButton)},get summaryButton(){return document.querySelector(s.reviewsSummaryButton)},get modal(){return document.querySelector(s.reviewsModal)},getFilteredList(r){let e=[...r];return t!=null&&t.dateFrom&&(t!=null&&t.dateTo)&&(e=e.filter(a=>{if(t!=null&&t.dateFrom&&(t!=null&&t.dateTo)&&a.date>=this.makeDateFromFilterString(t.dateFrom)&&a.date<=this.makeDateFromFilterString(t.dateTo))return a})),t!=null&&t.ratingFrom&&(t!=null&&t.ratingTo)&&(e=e.filter(a=>{if(t!=null&&t.ratingFrom&&(t!=null&&t.ratingTo)&&a.rating>=(t==null?void 0:t.ratingFrom)&&a.rating<=(t==null?void 0:t.ratingTo))return a})),t!=null&&t.productName&&(e=e.filter(a=>{let o=a.productName.toLowerCase(),i=t.productName.toLowerCase();if(o.includes(i))return a})),t!=null&&t.deliveryOnly&&(e=e.filter(a=>a.delivery)),e},async parseItems(){let r=[],e=[...document.querySelectorAll(s.reviewsItem)];if(!e.length){await c({action:"reviews-parsing-ended",status:"error",currentUrl:l,message:"Отзывы не найдены"});return}for(const a of e){let o=a.querySelectorAll(s.reviewsItemRatingStars),i=a.querySelector(s.reviewsItemProductName),n=a.querySelector(s.reviewsItemDateDelivery),w=null,u=null,d=null;if(n!=null&&n.textContent&&(u=(n==null?void 0:n.textContent.split(",")[0])||null,w=(n==null?void 0:n.textContent.split(",")[1])||null),u&&(d=this.makeDateFromReviewString(u)),!u||!d){await c({action:"reviews-parsing-ended",status:"error",currentUrl:l,message:"Не найдены селекторы в отзывах"});break}let g={date:d||0,dateText:u||"Информация не найдена",delivery:!!w,productName:(i==null?void 0:i.textContent)||"Информация не найдена",rating:(o==null?void 0:o.length)||0,profileUrl:l};if(r.push(g),t!=null&&t.dateFrom&&g.date<=this.makeDateFromFilterString(t==null?void 0:t.dateFrom)){this.parsingEnded=!0;break}}if(this.parsingEnded){const a=this.getFilteredList(r);await c({action:"reviews-parsing-ended",status:"success",currentUrl:l,message:"Парсинг отзывов завершен",data:a}),window.close()}else r=[],this.modal?this.loadMoreInModal():this.loadMoreOnPage()},async loadMoreInModal(){var a,o;const r=(a=this.modal)==null?void 0:a.querySelector(s.reviewsModalScroller),e=(o=this.modal)==null?void 0:o.querySelector(s.reviewsModalScrollerInner);(!r||!e)&&await c({action:"reviews-parsing-ended",status:"error",currentUrl:l,message:"Не найден селектор для скрола в модалке"}),r&&e&&(p(r,e.clientHeight),await m(2e3),this.parseItems())},async loadMoreOnPage(){f(),await m(2e3),this.loadMoreButton&&this.loadMoreButton.click(),await m(3e3),this.parseItems()},async parsingStart(){var r;await c({action:"reviews-parsing-started",status:"success",currentUrl:l,message:"Парсинг отзывов запущен"}),await m(1e3),(r=this.summaryButton)==null||r.click(),await m(3e3),this.parseItems()}};chrome.runtime.onMessage.addListener(async({action:r,filterFields:e,currentUrl:a})=>{if(!e){await c({action:"reviews-parsing-ended",status:"error",currentUrl:l,message:"Страница не получила поля фильтра"});return}r==="reviews-parsing-start"&&e&&(l=a,t=e,t&&h(),v.parsingStart())});
