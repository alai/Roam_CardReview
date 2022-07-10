(()=>{
if (document.readyState !== 'loading'){
        addTopButton()
} else {
    document.addEventListener('DOMContentLoaded', addTopButton)
}

window.addEventListener('popstate', addTopButton);

function addTopButton(){
    let ready_to_cardview = false;
    if (checkIfCardView() && checkIfCardViewExpand()) ready_to_cardview = true;
    let cardview_button = document.querySelector('span[icon="card-view"]');
    let icon = cardViewIcon("active");
    console.log(ready_to_cardview);
    if (ready_to_cardview){
        if (cardview_button === null) {
            buttonToggle("active")
        }
    } else {
        if (cardview_button === null) {
            buttonToggle("no-active")
        } else {
            icon = cardViewIcon("no-active");
        }
    }
    if (cardview_button !== null) cardview_button.innerHTML = icon;
}

// Manual testing workflow:
function goCardView(){
    const has_cardview_tag = checkIfCardView();
    const cardview_expand = checkIfCardViewExpand();
    if (has_cardview_tag && cardview_expand){
        var cards = obtainCardData()
        console.log(cards);
        createCardViewCSS(card_css)
        injectCardArea(cards)
        addButtonListeners(cards)
    } else {
        console.log("Make sure having #CardView tag and content expanded.")
        return;
    }
}

// Define the card related css
const card_css = `/* css for roam review card plugin */
.cardview-content {
    margin: auto;
    border-radius: 15px;
    width: 75%;
    font-family: auto;
    font-size: x-large;
    line-height: 1.6em;
    color: #464242;
    padding: 3em 2em 2em 2em;
}
/* reveal card back button behavior */
.card-bottom > span:hover {
    cursor: pointer;
}
/* card body */
.card-body {
    flex: 0 0 80%;
}
/* card front */
#cardview > .front {
    background-color: #F5FFEF;
}
/* card back */
#cardview > .back {
    display: none;
    background-color: #D3F0FC;
}
.back > .card-upper> .card-body {
    border-left: 10px solid #e9faff;
    margin-left: -15px;
}
.back > .card-upper > .card-body > p {
    margin: 0 0 10px 20px;
    font-family: "Charter","STFangsong";
}
/* main style for cardview */
#cardview {
    /* display: none; */
    position: fixed;
    z-index: 1000;
    padding-top: 100px;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgb(0,0,0);
    background-color: rgba(0,0,0,0.4);
} 
/* upper container */
.card-upper {
    display: flex;
    flex-direction: row;
}
/* arrow color */
.front > .card-upper > .card-arrow {
    color: #5acd95;
}
.back > .card-upper > .card-arrow {
    color: #fff;
}
/* arrow style */
.card-arrow {
    width: -webkit-fill-available;
    margin-top: auto;
    margin-bottom: auto;
    flex: 0 0 10%;
}
.card-upper > .card-arrow:hover {
    cursor: pointer;
}
/* preview card arrow */
.pre-note {
    text-align: left;
}
/* next card arrow*/
.next-note {
    text-align: right;
}
/* bottom area (under card body) style */
.card-bottom {
    text-align: right;
    padding-right: 3em;
}
/* bottom area text color */
.front > .card-bottom {
    color: #5acd95;
}
.back > .card-bottom {
    color: #fff;
}
/* card back text color */
.back > .card-body {
    color: #3e4041;
    font-family: "ST Fangsong";
    letter-spacing: 0.1em;
}
/* card serial number*/
.card-serial {
    display: none;
}
/* #CardView tag style */
span.rm-page-ref[data-tag="CardView"] {
	background: #fff;
  	color: rgb(153,153,153);
	background-size: 100%;
    font-family: "Avenir Next Condensed";
    padding: 1px 4px 1px 4px;
    font-size: 12px;
    line-height: 1em;
    font-weight: 500;
    border-radius: 5px 5px 5px 5px;
    position:relative;
}`;

function injectCSS(cssString){
    // inject roam card review related css into app
    const style_sheet = document.createElement('style');
    style_sheet.innerText = cssString.replaceAll('<br>','');
    document.head.appendChild(style_sheet);
}

function injectCardArea(card_data){
    // add #cardview element under the Roam app
    //console.log(card_data)
    const roam_body = document.getElementsByClassName('roam-body')[0];
    const card_view = cardView(card_data,0);
    //console.log(card_view);
    const cardview_div = document.getElementById("cardview");
    if (cardview_div === null ){
        // if the 1st time run the plugin
        roam_body.appendChild(card_view);
    } else {
        // if the cardview id exists
        cardview_div.innerHTML = card_view.innerHTML;
        cardview_div.style.display = "block";
    }
}

function escapeKeys(card_data){
    // add listener to escape key down
    const cardview = document.getElementById("cardview")
    const butn_pre = document.querySelectorAll("span.card-arrow")[0];
    const butn_nxt = document.querySelectorAll("span.card-arrow")[1];
    document.addEventListener('keydown', function(e) {
        if (e.keyCode == 27){ // escape
            cardview.style.display = "none";
        }
        else if (e.keyCode == 37){ //left arrow
            navigatePreNxt(card_data,to="pre");
        }
        else if (e.keyCode == 39){ //right arrow
            navigatePreNxt(card_data,to="next");
        }
    });


}

function addButtonListeners(card_data){
    // add click event listeners to card buttons
    const butn_reveal_back = document.querySelectorAll(".card-bottom > span");
    butn_reveal_back.forEach(button => {
        button.addEventListener("click",(event) => {
            // reveal the card back
            //console.log('card reveal button clicked.')
            const cardview_back = document.querySelector("#cardview > .back");
            const cardview_front = document.querySelector("#cardview > .front");
            if (cardview_back.style.display === "none" || cardview_back.style.display === ""){ // to reveal the back
                cardview_front.style.display = "none";
                cardview_back.style.display = "block";
            } else { // to reveal the front again
                cardview_front.style.display = "block";
                cardview_back.style.display = "none";
            }
        }, true);
    });
    const butn_pre_next = document.querySelectorAll("span.card-arrow");
    butn_pre_next.forEach(button => {
        button.addEventListener("click",(event) => {
            // previous or next card
            pre_or_next = event.target.classList[1];
            const cur_card_serial = parseInt(document.getElementsByClassName('card-serial')[0].textContent);
            const card_div =  document.getElementById('cardview');
            if (pre_or_next === 'next-note'){
                // jump to the next card front
                navigatePreNxt(card_data,to="next");
            } else {
                // check whether the first card then jump to the previous card front
                if (cur_card_serial !== 0){
                    navigatePreNxt(card_data,to="pre");
                } else {
                    return;
                }
            }
        }, true)
    });
    escapeKeys(card_data);
}

function navigatePreNxt(card_data,to="pre"){
    const cur_card_serial = parseInt(document.getElementsByClassName('card-serial')[0].textContent);
    //console.log(cur_card_serial);
    const card_div =  document.getElementById('cardview');
    let card_serial = 1;
    if (to === "pre"){
        card_serial = cur_card_serial - 1;
    } else {
        card_serial = cur_card_serial + 1;
    }
    //console.log(card_serial);
    const target_card_pair = cardView(card_data,card_serial);
    card_div.innerHTML = target_card_pair.innerHTML;
    addButtonListeners(card_data);
}

function obtainCardData(){
    const elem_cards = document.querySelector('div[data-page-links*="CardView"]').getElementsByClassName('rm-reference-item');
    let re = [], s_re = [];
    let p = '', c = '';
    for (i=0;i<elem_cards.length;i++){
        const card = elem_cards[i];
        s_re = [];
        try {
            [p,c] = card.getElementsByClassName('hoverparent');
            const note = p.innerText;
            const quote = c.innerText;
            s_re = [note,quote];
            re.push(s_re);
        } catch (e) {
            console.log(e);
            console.log(card[i]);
        }
    };
    return re;
}
  
function cardView(card_data,n){
    // use the card pair generated by obtainCardData() to generate html
    // the input data in the format of [card_front0,card_back0]
    // output is a pair of DOM objects for card front and back
    const card_pair = card_data[n];
    //console.log(card_pair);
    let card_div = document.createElement('div');
    card_div.id = 'cardview';
    // add an invisible card serial here
    let card_serial = document.createElement('span');
    card_serial.setAttribute('class','card-serial');
    card_serial.innerText = String(n);
    card_div.appendChild(card_serial);
    const front = cardFace(0,card_pair[0]);
    const back = cardFace(1,card_pair[1]);
    card_div.appendChild(front);
    card_div.appendChild(back);
    return card_div;
}
 
function cardFace(front=0,bodyText){
    // document createElement function to generate div#article DOM for both front and back of the card
    // v2 add tag identification 
    const re_tag = /\#\S+\s|\#.+$/gm;
    let tag_template = `<span tabindex="-1" data-tag="_tag" class="rm-page-ref rm-page-ref--tag">_tag</span>`
    let face = '';
    if (front === 0){
      face = 'front';
    } else {
      face = 'back'
    }
    // article
    let card_face = document.createElement('article');
    // card-view front back
    card_face.setAttribute('class', 'cardview-content '+face);
    // upper bottom
    let upper = document.createElement('div');
    let bottom = document.createElement('div');
    upper.setAttribute('class','card-upper');
    bottom.setAttribute('class','card-bottom');
    // card-arrow pre-note next-note
    let pre_arrow = document.createElement('span');
    pre_arrow.setAttribute('class','card-arrow pre-note')
    let next_arrow = document.createElement('span');
    next_arrow.setAttribute('class','card-arrow next-note')
    pre_arrow.innerText = '<';
    next_arrow.innerText = '>';
    let note_body = document.createElement('span');
    note_body.setAttribute('class','card-body');
    let body_p = document.createElement('p');
    if (bodyText.match(re_tag) !== null){
        for (tag of bodyText.match(re_tag)){
            wrap_t = tag_template.replaceAll("_tag",tag);
            bodyText = bodyText.replaceAll(tag,wrap_t);
        }
        body_p.innerHTML = bodyText;
    } else {
        body_p.innerText = bodyText;
    }
    note_body.appendChild(body_p);
    upper.appendChild(pre_arrow);
    upper.appendChild(note_body);
    upper.appendChild(next_arrow);
    let back_arrow = document.createElement('span');
    back_arrow.innerText = '↩︎';
    bottom.appendChild(back_arrow);
    card_face.appendChild(upper);
    card_face.appendChild(bottom);
    return card_face 
}

function saveCardDataToStorage(card_data){
    Storage.prototype.setObj = function(key, obj) {
        return this.setItem(key, JSON.stringify(obj))
    }
    Storage.prototype.getObj = function(key) {
        return JSON.parse(this.getItem(key))
    }
    localStorage.setObj('roam_cards',card_data)
}

function createCardViewCSS(css){
    // add css to roam/css if node "Card Review CSS" doesn't exist
    css = "\`\`\`css\n"+css+"\`\`\`"
    const css_node_title = "Card Review CSS";
    const css_page = getPage("roam/css")
    const cur_css_nodes = getTreeByPageTitle("roam/css")
    for (let i = 0; i < cur_css_nodes.length; i ++){
        const node_title = cur_css_nodes[i][1];
        if (node_title === css_node_title){
            console.log(css_node_title,"already exist.")
            return;
        }
    }
    const css_idx = cur_css_nodes.length + 1; 
    const title_node_uid = window.roamAlphaAPI.util.generateUID();
    const css_uid = window.roamAlphaAPI.util.generateUID();
    window.roamAlphaAPI.createBlock(
        {
            "location": {"parent-uid":css_page, "order": css_idx},
            "block": {"string": css_node_title, "uid": title_node_uid}
        }
    );
    window.roamAlphaAPI.createBlock(
        {
            "location": {"parent-uid":title_node_uid, "order": 0},
            "block": {"string": css, "uid": css_uid}
        }
    );
}

function getPage(page) {
  // returns the uid of a specific page in your graph.
  // _page_: the title of the page.
  let results = window.roamAlphaAPI.q(`
    [:find ?uid
     :in $ ?title
     :where
     [?page :node/title ?title]
     [?page :block/uid ?uid]
    ]`, page);
  if (results.length) {
    return results[0][0];
  }
}

function getTreeByPageTitle(pageTitle) {
return window.roamAlphaAPI.q(
  `[:find ?uid ?s 
    :where [?b :node/title "${pageTitle}"]
           [?b :block/children ?cuid]
           [?cuid :block/uid ?uid]
           [?cuid :block/string ?s]]`);
}

function checkIfCardView(){
    try {
        const cardview_tag = document.querySelector('div[data-page-links*="CardView"]')
        if (cardview_tag === null){
            return false;
        } else {
            //console.log("Found CardView tag.")
            return true;
        }
    } catch (e){
        console.log("Make sure #CardView tag added.")
        return;
    }
}

function checkIfCardViewExpand(){
    try {
        const card_elements = document.querySelector('div[data-page-links*="CardView"]').getElementsByClassName('rm-reference-item');
        if (card_elements.length === 0){
            //console.log("CardView contents are collapsed.")
            return false;
        } else {
            //console.log("CardView content are expanded.")
            return true;
        }
    } catch(e) {
        console.log("Make sure the CardView content expanded.")
        return;
    }
}

function buttonToggle(buttonState) {
    // set button color according to states
    let icon_color = "#aaa"
    if (buttonState === "active") icon_color = "#5d6f81";
    const svg_icon = `<span icon="card-view" aria-hidden="true" class="bp3-icon bp3-icon-calendar"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 4H2v16h20V4H4zm0 2h16v12H4V6zm2 2h12v2H6V8zm0 4h10v2H6v-2z" fill="${icon_color}"></path></svg></span>`;

    // add button
    var nameToUse = "cardview",
       checkForButton = document.getElementById(nameToUse + "-icon");
    if (!checkForButton) {
       var mainButton = document.createElement("span");
       (mainButton.id = nameToUse + "-button"),
       mainButton.classList.add("bp3-popover-wrapper");
       var spanTwo = document.createElement("span");
       spanTwo.classList.add("bp3-popover-target"), mainButton.appendChild(spanTwo);
       var mainIcon = document.createElement("span");
       (mainIcon.id = nameToUse + "-icon"),
       mainIcon.classList.add(
             "bp3-icon-" + nameToUse,
             "bp3-button",
             "bp3-minimal",
             "bp3-small"
          ),
          mainIcon.innerHTML = svg_icon;
          spanTwo.appendChild(mainIcon);
       var roamTopbar = document.getElementsByClassName("rm-topbar"),
          nextIconButton = roamTopbar[0].lastElementChild,
          flexDiv = document.createElement("div");
       (flexDiv.id = nameToUse + "-flex-space"),
       (flexDiv.className = "rm-topbar__spacer-sm"),
       nextIconButton.insertAdjacentElement("afterend", mainButton),
          mainButton.insertAdjacentElement("afterend", flexDiv),
          mainButton.addEventListener("click", goCardView);
       console.log("CardView 0.3");
    }
}

function cardViewIcon(status) {
    let icon_color = "#aaa"
    if (status === "active") icon_color = "#5d6f81";
    let svg_icon = `<span icon="card-view" aria-hidden="true" class="bp3-icon bp3-icon-calendar"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 4H2v16h20V4H4zm0 2h16v12H4V6zm2 2h12v2H6V8zm0 4h10v2H6v-2z" fill="${icon_color}"></path></svg></span>`;
    //console.log(svg_icon);
    return svg_icon;
}

})();
