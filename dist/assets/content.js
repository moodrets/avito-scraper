let t=null;const n={profileName:".desktop-1r4tu1s",profileReviewsCount:".desktop-fgq05w",profileRating:'[data-marker="profile/score"]',profileSubscribers:'[data-marker="favorite-seller-counters"]',profileDeviveryInfo:".Sidebar-root-h24MJ .ProfileBadge-root-bcR8G:nth-child(2)",reviewsItem:".style-snippet-E6g8Y",reviewsItemProductName:".desktop-35wlrd",reviewsItemDateDelivery:".desktop-11ffzh3",reviewsItemRatingStars:".RatingStars-root-Edhhx .Attributes-yellow-star-PY9XT",reviewsMoreLoadButton:'[data-marker="rating-list/moreReviewsButton"]',reviewsSummaryButton:'[data-marker="profile/summary"]',reviewsModal:'[data-marker="profile-rating-detailed/popup"]',reviewsMoreLoadErrorButton:'[data-marker="errorMessage/button"]'};async function u(a){await chrome.runtime.sendMessage(a)}async function d(a){return new Promise(e=>{setTimeout(()=>{e(!0)},a)})}function m(){window.scrollTo({left:0,top:document.body.scrollHeight,behavior:"smooth"})}async function f(a){const e=document.querySelector(n.profileName),r=document.querySelector(n.profileReviewsCount),o=document.querySelector(n.profileRating),s=document.querySelector(n.profileSubscribers),l=document.querySelector(n.profileDeviveryInfo),i={createdDate:Date.now(),createdDateFormatted:new Date().toLocaleString("ru-RU"),name:(e==null?void 0:e.textContent)||"Информация не найдена",rating:(o==null?void 0:o.textContent)||"Информация не найдена",reviewsCount:(r==null?void 0:r.textContent)||"Информация не найдена",subscribers:(s==null?void 0:s.textContent)||"Информация не найдена",deliveryInfo:(l==null?void 0:l.textContent)||"Информация не найдена",existsInDataBase:!1,url:a.profileLink};await u({toastType:"success",toastText:"Получена информация профиля",profileInform:i})}const y={getDateOrDeliveryText(a,e){let r=a.split(",");return r[0]&&e==="date"?r[0]:r[1]&&e==="delivery"?r[1]:null},makeMonthNumberFromText(a){let e="";switch(a){case"января":e="01";break;case"февраля":e="02";break;case"марта":e="03";break;case"апреля":e="04";break;case"мая":e="05";break;case"июня":e="06";break;case"июля":e="07";break;case"августа":e="08";break;case"сентября":e="09";break;case"октября":e="10";break;case"ноября":e="11";break;case"декабря":e="12";break}return e},makeDateFromString(a){if(a.trim()==="сегодня")return Date.now();if(a.trim()==="вчера")return new Date().setDate(new Date().getDate()-1);let e=a.split(" "),r=e[0],o=this.makeMonthNumberFromText(e[1]),s=e[2]||`${new Date().getFullYear()}`;return Date.parse(`${s} ${o} ${r}`)},makeDateFromFilterString(a){let e=a.split("."),r=e[0],o=e[1],s=e[2];return Date.parse(`${s} ${o} ${r}`)},get loadMoreButton(){return document.querySelector(n.reviewsMoreLoadButton)},get summaryButton(){return document.querySelector(n.reviewsSummaryButton)},get modal(){return document.querySelector(n.reviewsModal)},getFilteredList(a){let e=[...a];return t!=null&&t.dateFrom&&(t!=null&&t.dateTo)&&(e=e.filter(r=>{if(t!=null&&t.dateFrom&&(t!=null&&t.dateTo)&&r.date>=this.makeDateFromFilterString(t.dateFrom)&&r.date<=this.makeDateFromFilterString(t.dateTo))return r})),t!=null&&t.ratingFrom&&(t!=null&&t.ratingTo)&&(e=e.filter(r=>{if(t!=null&&t.ratingFrom&&(t!=null&&t.ratingTo)&&r.rating>=(t==null?void 0:t.ratingFrom)&&r.rating<=(t==null?void 0:t.ratingTo))return r})),t!=null&&t.productName&&(e=e.filter(r=>{let o=r.productName.toLowerCase(),s=t.productName.toLowerCase();if(o.includes(s))return r})),t!=null&&t.deliveryOnly&&(e=e.filter(r=>r.delivery)),e},async parseItems(){const a=[],e=document.querySelectorAll(n.reviewsItem);if(!e.length){await u({action:"reviews-parsing-ended",toastType:"error",toastText:"Отзывы не найдены"});return}e.forEach(o=>{const s=o.querySelectorAll(n.reviewsItemRatingStars),l=o.querySelector(n.reviewsItemProductName),i=o.querySelector(n.reviewsItemDateDelivery);let w=null,c=null,g=null;i!=null&&i.textContent&&(c=this.getDateOrDeliveryText(i.textContent,"date")),i!=null&&i.textContent&&(w=this.getDateOrDeliveryText(i.textContent,"delivery")),c&&(g=this.makeDateFromString(c)),a.push({date:g||0,dateText:c||"Информация не найдена",delivery:!!w,productName:(l==null?void 0:l.textContent)||"Информация не найдена",rating:(s==null?void 0:s.length)||0})});const r=this.getFilteredList(a);await u({action:"reviews-parsing-ended",toastType:"success",toastText:"Парсинг отзывов завершен",reviewsFilteredList:r})},async loadMoreInModal(){},async loadMoreOnPage(){if(m(),await d(2e3),this.loadMoreButton&&(this.loadMoreButton.click(),this.loadMoreOnPage()),!this.loadMoreButton){if(await d(2e3),this.loadMoreButton){this.loadMoreOnPage();return}m(),this.parseItems()}},async parsingStart(){var a;if(await u({action:"reviews-parsing-started",toastType:"success",toastText:"Парсинг отзывов запущен"}),(a=this.summaryButton)==null||a.click(),await d(3500),this.modal){this.loadMoreInModal();return}m(),await d(2e3),this.loadMoreOnPage()}};chrome.runtime.onMessage.addListener(async({action:a,filterFields:e})=>{if(!e){await u({toastType:"success",toastText:"Страница не получила поля фильтра"});return}a==="reviews-parsing-start"&&e&&(t=e,f(e),y.parsingStart())});
