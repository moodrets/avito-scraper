var I=Object.defineProperty;var N=(s,e,t)=>e in s?I(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var o=(s,e,t)=>(N(s,typeof e!="symbol"?e+"":e,t),t);async function d(s){await chrome.runtime.sendMessage(s)}async function p(s){return new Promise(e=>{setTimeout(()=>{e(!0)},s)})}function U(){let s=Math.floor(Math.random()*256-1),e=Math.floor(Math.random()*256-1),t=Math.floor(Math.random()*256-1),r=(s*299+e*587+t*114)/1e3,i=(255*299+255*587+255*114)/1e3,a=(0*299+0*587+0*114)/1e3;return{text:Math.abs(r-i)>Math.abs(r-a)?"rgb(255, 255, 255)":"rgb(0, 0, 0)",bg:`rgb(${s},${e},${t})`}}function g(s,e){return Math.floor(Math.random()*(e-s+1))+s}async function P(s){const e={profileName:'.Sidebar-root-h24MJ [data-marker*="name"]',profileReviewsCount:".Sidebar-root-h24MJ .desktop-fgq05w",profileRating:'.Sidebar-root-h24MJ [data-marker="profile/score"]',profileSubscribers:'.Sidebar-root-h24MJ [data-marker="favorite-seller-counters"]',profileAsideInfoItems:".Sidebar-root-h24MJ .ProfileBadge-root-bcR8G",profileActiveAdds_1:'[data-marker="profile-tab(active)"]',profileActiveAdds_2:'#item_list_with_filters button[type="button"][data-num="0"]',profileActiveAdds_3:"#item_list_with_filters .desktop-1r4tu1s",profileCompletedAdds_1:'#item_list_with_filters button[type="button"][data-num="1"]',profileCompletedAdds_2:'[data-marker="profile-tab(closed)"]'};let t=document.querySelector(e.profileName),r=document.querySelector(e.profileReviewsCount),i=document.querySelector(e.profileRating),a=document.querySelector(e.profileSubscribers),l=[...document.querySelectorAll(e.profileAsideInfoItems)].find(D=>{var h;return(h=D.textContent)==null?void 0:h.includes("продаж")}),n=document.querySelector(e.profileActiveAdds_1),u=document.querySelector(e.profileActiveAdds_2),c=document.querySelector(e.profileActiveAdds_3),f=document.querySelector(e.profileCompletedAdds_1),m=document.querySelector(e.profileCompletedAdds_2),w=a!=null&&a.textContent?a.textContent.split(",")[0]:null,C=n!=null&&n.textContent?n.textContent.replace(/\D/g,""):null,v=u!=null&&u.textContent?u.textContent.replace(/\D/g,""):null,F=c!=null&&c.textContent?c.textContent.replace(/\D/g,""):null,S=f!=null&&f.textContent?f.textContent.replace(/\D/g,""):null,b=m!=null&&m.textContent?m.textContent.replace(/\D/g,""):null,R=i!=null&&i.textContent?i.textContent.replace(",","."):"",y=t!=null&&t.textContent?t.textContent:null,L=r!=null&&r.textContent?r.textContent:null,x=l!=null&&l.textContent?l.textContent:null,k={name:y||"Информация не найдена",rating:R||"Информация не найдена",reviewsCount:L||"Информация не найдена",subscribers:w||"Информация не найдена",deliveryInfo:x||"Нет продаж с Авито Доставкой",activeAdds:C||v||F||"Информация не найдена",completedAdds:S||b||"",parsingDate:Date.now(),reviewsSortedBy:"product_name_asc",url:s,opened:!1,loading:!1,marked:!1,comment:"",color:U()};await d({action:"profile-info",status:"success",currentUrl:s,messsage:"Получена информация профиля",data:k})}class A{constructor(e,t){o(this,"currentURL");o(this,"filterFields");o(this,"offset",0);o(this,"parsingEnded",!1);o(this,"reviewsCollection",[]);this.filterFields=e,this.currentURL=t}makeDateFromFilterString(e){let t=e.split("."),r=t[0],i=t[1],a=t[2];return Date.parse(`${a} ${i} ${r}`)}makeMonthNumberFromText(e){let t="";switch(e){case"января":t="01";break;case"февраля":t="02";break;case"марта":t="03";break;case"апреля":t="04";break;case"мая":t="05";break;case"июня":t="06";break;case"июля":t="07";break;case"августа":t="08";break;case"сентября":t="09";break;case"октября":t="10";break;case"ноября":t="11";break;case"декабря":t="12";break}return t}makeDateFromReviewString(e){if(e.trim()==="сегодня")return Date.now();if(e.trim()==="вчера")return new Date().setDate(new Date().getDate()-1);let t=e.split(" "),r=t[0],i=this.makeMonthNumberFromText(t[1]),a=t[2]||`${new Date().getFullYear()}`;return Date.parse(`${a} ${i} ${r}`)}makeReviewItemData(e){return{date:this.makeDateFromReviewString(e.value.rated),dateText:e.value.rated,delivery:!!e.value.deliveryTitle,productName:e.value.itemTitle,rating:e.value.score,profileUrl:this.currentURL}}getFilteredList(e){let t=[...e];return this.filterFields.dateFrom&&this.filterFields.dateTo&&(t=t.filter(r=>{if(this.filterFields.dateFrom&&this.filterFields.dateTo&&r.date>=this.makeDateFromFilterString(this.filterFields.dateFrom)&&r.date<=this.makeDateFromFilterString(this.filterFields.dateTo))return r})),this.filterFields.ratingFrom&&this.filterFields.ratingTo&&(t=t.filter(r=>{if(this.filterFields.ratingFrom&&this.filterFields.ratingTo&&r.rating>=this.filterFields.ratingFrom&&r.rating<=this.filterFields.ratingTo)return r})),this.filterFields.productName&&(t=t.filter(r=>{let i=r.productName.toLowerCase(),a=this.filterFields.productName.toLowerCase();if(i.includes(a))return r})),this.filterFields.deliveryOnly&&(t=t.filter(r=>r.delivery)),t}async apiGetReviews(e){let t=new URL(this.currentURL),r=new URLSearchParams,l=`https://www.avito.ru/web/5/user/${t.pathname.split("/")[2]}/ratings`;return e==="first"&&r.set("summary_redesign","1"),e==="next"&&(this.offset+=25,r.set("limit","25"),r.set("offset",`${this.offset}`),r.set("sortRating","date_desc"),r.set("summary_redesign","1")),l=`${l}?${r.toString()}`,(await(await fetch(l)).json()).entries.filter(f=>f.type==="rating")||[]}async parseReviews(e){await p(g(2,10)*1e3);try{let t=await this.apiGetReviews(e);this.reviewsCollection.push(...t);let r=this.makeReviewItemData(this.reviewsCollection[this.reviewsCollection.length-1]);if(this.filterFields.dateFrom&&r.date<this.makeDateFromFilterString(this.filterFields.dateFrom)&&(this.parsingEnded=!0),this.parsingEnded){let i=[];for(let l of this.reviewsCollection){let n=this.makeReviewItemData(l);i.push(n)}let a=this.getFilteredList(i);await d({action:"reviews-parsing-ended",status:"success",currentUrl:this.currentURL,data:a}),this.filterFields.closeTabs&&window.close()}else this.parseReviews("next")}catch{await d({action:"reviews-parsing-ended",status:"error",currentUrl:this.currentURL,message:"Ошибка запроса отзывов"})}finally{}}async parsingStart(){await d({action:"reviews-parsing-started",status:"success",currentUrl:this.currentURL}),this.parseReviews("first")}}class _{constructor(e,t){o(this,"SELECTORS",{profileItem:".iva-item-userInfoStep-dWwGU",profileItemLink:"a",profileItemName:"a p",profileItemRating:'[data-marker="seller-rating/score"]',profileItemReviewsCount:'[data-marker="seller-rating/summary"]'});o(this,"currentURL");o(this,"filterFields");o(this,"currentPageNumber",0);o(this,"profilesCollection",[]);this.filterFields=e,this.currentURL=t}getFilteredList(){let e=[...this.profilesCollection];return this.filterFields.reviewsCount&&(e=e.filter(t=>{if(t.reviewsCount>=this.filterFields.reviewsCount)return t})),this.filterFields.profileName&&(e=e.filter(t=>{let r=this.filterFields.profileName.toLowerCase(),i=t.name.toLowerCase();if(i.includes(r)||i===r)return t})),e}makeProfileItemData(e){var c;let t=e.querySelector(this.SELECTORS.profileItemLink),r=e.querySelector(this.SELECTORS.profileItemName),i=e.querySelector(this.SELECTORS.profileItemRating),a=e.querySelector(this.SELECTORS.profileItemReviewsCount),l=(c=a==null?void 0:a.textContent)==null?void 0:c.replace(/\D/g,""),n=i!=null&&i.textContent?parseFloat(i.textContent.replace(",",".")):0;return{url:t.href,name:r.textContent||"",rating:n,reviewsCount:l?+l:0,existsInDataBase:!1}}async parseProfiles(e){await p(g(2,10)*1e3),await this.apiGetAdds(e)}async apiGetAdds(e){e==="first"&&(this.currentPageNumber=+this.filterFields.pageStart),e==="next"&&(this.currentPageNumber+=1),d({action:"profiles-parsing-current-page",status:"success",currentUrl:this.currentURL,data:this.currentPageNumber});let t=new URL(this.currentURL);t.searchParams.delete("p"),this.currentPageNumber!==1&&t.searchParams.set("p",`${this.currentPageNumber}`);try{let i=await(await fetch(t.toString())).text();new DOMParser().parseFromString(i,"text/html").body.querySelectorAll(this.SELECTORS.profileItem).forEach(n=>{let u=this.makeProfileItemData(n);this.profilesCollection.push(u)}),this.currentPageNumber===+this.filterFields.pageEnd?await d({action:"profiles-parsing-ended",status:"success",currentUrl:this.currentURL,data:this.getFilteredList()}):this.parseProfiles("next")}catch{await d({action:"profiles-parsing-ended",status:"error",currentUrl:this.currentURL})}finally{}}async parsingStart(){await d({action:"profiles-parsing-started",status:"success",currentUrl:this.currentURL}),this.parseProfiles("first")}}chrome.runtime.onMessage.addListener(async({action:s,currentUrl:e,reviewsFilterFields:t,profilesFilterFields:r})=>{if(s==="profiles-parsing-start"){await p(1e3),new _(r,e).parsingStart();return}s==="reviews-parsing-start"&&t&&(await p(1e3),P(e),new A(t,e).parsingStart())});
