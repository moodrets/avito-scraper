let t=null,n="";const s={profileName:".Sidebar-root-h24MJ .desktop-1r4tu1s",profileReviewsCount:".Sidebar-root-h24MJ .desktop-fgq05w",profileRating:'.Sidebar-root-h24MJ [data-marker="profile/score"]',profileSubscribers:'.Sidebar-root-h24MJ [data-marker="favorite-seller-counters"]',profileAsideInfoItems:".Sidebar-root-h24MJ .ProfileBadge-root-bcR8G",reviewsItem:".style-snippet-E6g8Y",reviewsItemProductName:".desktop-35wlrd",reviewsItemDateDelivery:".desktop-11ffzh3",reviewsItemRatingStars:".RatingStars-root-Edhhx .Attributes-yellow-star-PY9XT",reviewsMoreLoadButton:'[data-marker="rating-list/moreReviewsButton"]',reviewsMoreLoadButtonError:'[data-marker="errorMessage/button"]',reviewsSummaryButton:'[data-marker="profile/summary"]',reviewsModal:'[data-marker="profile-rating-detailed/popup"]',reviewsModalScroller:".desktop-y382as",reviewsModalScrollerInner:".style-root-qXsDs"};async function d(r){await chrome.runtime.sendMessage(r)}async function u(r){return new Promise(e=>{setTimeout(()=>{e(!0)},r)})}function g(){window.scrollTo({left:0,top:document.body.scrollHeight,behavior:"smooth"})}function f(r,e){r.scrollTo({top:e,behavior:"smooth"})}function p(){let r="#";for(let e=0;e<3;e++)r+=("0"+Math.floor((1+Math.random())*Math.pow(16,2)/2).toString(16)).slice(-2);return r}async function h(){let r=document.querySelector(s.profileName),e=document.querySelector(s.profileReviewsCount),a=document.querySelector(s.profileRating),o=document.querySelector(s.profileSubscribers),i=[...document.querySelectorAll(s.profileAsideInfoItems)].find(m=>{var w;return(w=m.textContent)==null?void 0:w.includes("прода")}),l=o!=null&&o.textContent?o.textContent.split(",")[0]:null,c={parsingDate:Date.now(),name:(r==null?void 0:r.textContent)||"Информация не найдена",rating:(a==null?void 0:a.textContent)||"Информация не найдена",reviewsCount:(e==null?void 0:e.textContent)||"Информация не найдена",subscribers:l||"Информация не найдена",deliveryInfo:(i==null?void 0:i.textContent)||"Нет продаж с Авито Доставкой",reviewsSortedBy:"productName",url:n,opened:!1,loading:!1,comment:"",color:p()};await d({action:"profile-info",status:"success",currentUrl:n,messsage:"Получена информация профиля",data:c})}const v={parsingEnded:!1,makeMonthNumberFromText(r){let e="";switch(r){case"января":e="01";break;case"февраля":e="02";break;case"марта":e="03";break;case"апреля":e="04";break;case"мая":e="05";break;case"июня":e="06";break;case"июля":e="07";break;case"августа":e="08";break;case"сентября":e="09";break;case"октября":e="10";break;case"ноября":e="11";break;case"декабря":e="12";break}return e},makeDateFromReviewString(r){if(r.trim()==="сегодня")return Date.now();if(r.trim()==="вчера")return new Date().setDate(new Date().getDate()-1);let e=r.split(" "),a=e[0],o=this.makeMonthNumberFromText(e[1]),i=e[2]||`${new Date().getFullYear()}`;return Date.parse(`${i} ${o} ${a}`)},makeDateFromFilterString(r){let e=r.split("."),a=e[0],o=e[1],i=e[2];return Date.parse(`${i} ${o} ${a}`)},get loadMoreButton(){return document.querySelector(s.reviewsMoreLoadButton)},get loadMoreButtonError(){return document.querySelector(s.reviewsMoreLoadButtonError)},get summaryButton(){return document.querySelector(s.reviewsSummaryButton)},get modal(){return document.querySelector(s.reviewsModal)},getFilteredList(r){let e=[...r];return t!=null&&t.dateFrom&&(t!=null&&t.dateTo)&&(e=e.filter(a=>{if(t!=null&&t.dateFrom&&(t!=null&&t.dateTo)&&a.date>=this.makeDateFromFilterString(t.dateFrom)&&a.date<=this.makeDateFromFilterString(t.dateTo))return a})),t!=null&&t.ratingFrom&&(t!=null&&t.ratingTo)&&(e=e.filter(a=>{if(t!=null&&t.ratingFrom&&(t!=null&&t.ratingTo)&&a.rating>=(t==null?void 0:t.ratingFrom)&&a.rating<=(t==null?void 0:t.ratingTo))return a})),t!=null&&t.productName&&(e=e.filter(a=>{let o=a.productName.toLowerCase(),i=t.productName.toLowerCase();if(o.includes(i))return a})),t!=null&&t.deliveryOnly&&(e=e.filter(a=>a.delivery)),e},makeReviewItemData(r){let e=r.querySelectorAll(s.reviewsItemRatingStars),a=r.querySelector(s.reviewsItemProductName),o=r.querySelector(s.reviewsItemDateDelivery),i=null,l=null,c=null;return o!=null&&o.textContent&&(l=(o==null?void 0:o.textContent.split(",")[0])||null,i=(o==null?void 0:o.textContent.split(",")[1])||null),l&&(c=this.makeDateFromReviewString(l)),{date:c||0,dateText:l||"Информация не найдена",delivery:!!i,productName:(a==null?void 0:a.textContent)||"Информация не найдена",rating:(e==null?void 0:e.length)||0,profileUrl:n}},async parseItems(){if(this.loadMoreButtonError){this.loadMoreButton.click(),await u(3e3),this.parseItems();return}let r=[...document.querySelectorAll(s.reviewsItem)],e=[],a=r[r.length-1],o=this.makeReviewItemData(a);if(!r.length||!a){await d({action:"reviews-parsing-ended",status:"error",currentUrl:n,message:"Отзывы не найдены"});return}if(o.date===0){await d({action:"reviews-parsing-ended",status:"error",currentUrl:n,message:"Не найдены селекторы в отзывах"});return}if(t!=null&&t.dateFrom&&o.date<this.makeDateFromFilterString(t==null?void 0:t.dateFrom)&&(this.parsingEnded=!0),this.parsingEnded){for(let l of r){let c=this.makeReviewItemData(l);e.push(c)}let i=this.getFilteredList(e);await d({action:"reviews-parsing-ended",status:"success",currentUrl:n,message:"Парсинг отзывов завершен",data:i})}else this.modal?this.loadMoreInModal():this.loadMoreOnPage()},async loadMoreInModal(){var a,o;const r=(a=this.modal)==null?void 0:a.querySelector(s.reviewsModalScroller),e=(o=this.modal)==null?void 0:o.querySelector(s.reviewsModalScrollerInner);if(!r||!e){await d({action:"reviews-parsing-ended",status:"error",currentUrl:n,message:"Не найден селектор для скрола в модалке"});return}r&&e&&(f(r,e.clientHeight),await u(2e3),this.parseItems())},async loadMoreOnPage(){g(),await u(2e3),this.loadMoreButton&&this.loadMoreButton.click(),await u(3e3),this.parseItems()},async parsingStart(){var r;await d({action:"reviews-parsing-started",status:"success",currentUrl:n,message:"Парсинг отзывов запущен"}),await u(1e3),(r=this.summaryButton)==null||r.click(),await u(3e3),this.parseItems()}};chrome.runtime.onMessage.addListener(async({action:r,reviewsFilterFields:e,currentUrl:a})=>{if(!e){await d({action:"reviews-parsing-ended",status:"error",currentUrl:n,message:"Страница не получила поля фильтра"});return}r==="reviews-parsing-start"&&e&&(await u(1e3),n=a,t=e,t&&h(),v.parsingStart())});
