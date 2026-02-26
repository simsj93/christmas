

const NOTES = {
    2: {
        title: "i",
        text: "When I first saw you it was on a computer screen: during covid and over Zoom. I think I eventually told you that I would pin your webcam window and study your eyes while Jackie talked. \n\n I felt like I knew you.  It was as though a future meaning too immense for time was spilling back into the present. We hadn’t spoken yet. \n \nThe Japanese call this Koi No Yokan. "
    },
    4: {
        title: "ii",
        text: "Every box asks for more.\nYou keep clicking anyway."
    },
    6: {
        title: "iii",
        text: "Effort compounds.\nSo does commitment."
    },
    8: {
        title: "iv",
        text: "Effort compounds.\nSo does commitment."
    },
    10: {
        title: "v",
        text: "Effort compounds.\nSo does commitment."
    },
    12: {
        title: "vi",
        text: "Effort compounds.\nSo does commitment."
    },
    14: {
        title: "vii",
        text: "Effort compounds.\nSo does commitment."
    },
    16: {
        title: "iix",
        text: "Effort compounds.\nSo does commitment."
    },
    18: {
        title: "ix",
        text: "Effort compounds.\nSo does commitment."
    },
    20: {
        title: "x",
        text: "Effort compounds.\nSo does commitment."
    },
    // add more as needed
};

const COLLECTIBLES = [
    { id: "can", name: "Can", src: "./assets/can.png", message: "a" },
    { id: "leash", name: "Leash", src: "./assets/leash.png", message: "b" },
    { id: "shrimp", name: "Shrimp", src: "./assets/shrimp.png", message: "I know you don't like it but it's full of selenium." },
    { id: "shrimp", name: "Shrimp", src: "./assets/shrimp.png", message: "c" },
    { id: "shrimp", name: "Shrimp", src: "./assets/shrimp.png", message: "c" },
    { id: "shrimp", name: "Shrimp", src: "./assets/shrimp.png", message: "c" },
    { id: "shrimp", name: "Shrimp", src: "./assets/shrimp.png", message: "c" },
    { id: "shrimp", name: "Shrimp", src: "./assets/shrimp.png", message: "c" },
    { id: "shrimp", name: "Shrimp", src: "./assets/shrimp.png", message: "c" },
    // add more...


];



let collectibleIndex = 0; // tracks which one to award next



const boxes = Array.from({ length: 20 }, (_, i) => {
    let reward;

    if (i === 0) {
        reward = { type: "upgrade" };
    } else if ((i + 1) % 2 === 0) {
        reward = { type: "note", id: i + 1 };
    } else {
        // assign a collectible id deterministically
        const c = COLLECTIBLES[(i /* or any mapping */) % COLLECTIBLES.length];
        reward = { type: "collectible", id: c.id };
    }
    return { clicksRequired: Math.ceil(5 * Math.pow(2.5, i)), reward };
});


let currentIndex = 0;
let clicks = 0;
let totalClicks = 0;
let totalClicksPerClick = 1; // permanent +1 upgrades
let clickPower = 1; // base click power
let doubleActive = false;
let autoClickLevel = 0;          // how many “auto clicks” per tick
let autoClickIntervalId = null;  // interval handle
const AUTO_CLICK_TICK_MS = 1000; // 1x per second (adjust if you want)

let addClickValueCost = 1;
let doubleClickCost = 1;

const game = document.getElementById("game");
const overlay = document.getElementById("reward-overlay");
const rewardContent = document.getElementById("reward-content");
const collection = document.getElementById("collection");
const endScreen = document.getElementById("end-screen");
const clickCounter = document.getElementById("click-counter");
const upgradePanel = document.getElementById("upgrade-panel");

let centerBox, rightBox;

function createBox(className) {
    const box = document.createElement("div");
    box.className = `box ${className}`; // starts invisible (opacity:0)

    const wrapper = document.createElement("div");
    wrapper.className = "chest-wrapper";

    const img = document.createElement("img");
    img.src = "./assets/chest.png";
    img.className = "chest";
    img.alt = "Box";

    const fill = document.createElement("div");
    fill.className = "fill";

    wrapper.appendChild(fill);
    wrapper.appendChild(img);
    box.appendChild(wrapper);
    game.appendChild(box);

    // Force a reflow so the browser registers opacity:0
    void box.offsetWidth;

    // Add visible class after reflow to trigger transition
    setTimeout(() => {
        box.classList.add("visible");
    }, 50); // slight delay ensures transition works

    return box;
}

function setupBoxes() {
    centerBox = createBox("center");
    rightBox = createBox("right");
    centerBox.addEventListener("click", onClickBox);
}

function onClickBox() {
    const required = boxes[currentIndex].clicksRequired;

    // how much you *would* add
    const effectiveClick = totalClicksPerClick * clickPower;

    // how much room is left on this box
    const remaining = required - clicks;
    if (remaining <= 0) return;

    // apply only what fits (prevents overflow)
    const appliedClick = Math.min(effectiveClick, remaining);

    clicks += appliedClick;
    totalClicks += appliedClick;
    updateClickCounter();

    const progress = Math.min(clicks / required, 1);
    centerBox.querySelector(".fill").style.height = `${progress * 100}%`;

    if (progress >= 1) {
        clicks = required; // hard-cap in case of floating point edge cases
        centerBox.classList.add("complete");
        centerBox.removeEventListener("click", onClickBox);
        setTimeout(() => {
            const isFinalBox = currentIndex === boxes.length - 2;

            if (isFinalBox) {
                showFinalOverlay();   
                return;
            }

            if (currentIndex === 0) {
                showUpgradePanel();
            } else {
                openBox();
            }
        }, 400);
    }
}

function updateClickCounter() {
    clickCounter.textContent = `Bank: ${Math.floor(totalClicks)}`;
}

function openBox() {
    centerBox.classList.add("open");
    setTimeout(showReward, 400);
}

function showReward() {
    const reward = boxes[currentIndex].reward;
    overlay.classList.add("visible");
    rewardContent.innerHTML = "";

    if (reward.type === "note") {
        showNoteReward(reward.id);
    }

    if (reward.type === "collectible") {
        showCollectibleReward(reward.id);
    }

    if (currentIndex === 0) {
        const firstBoxMessage = document.createElement("p");
        firstBoxMessage.textContent = "You unlocked some upgrade options, but each box will require more clicks than the last. Do you want to open them all?";
        firstBoxMessage.style.fontWeight = "bold";
        firstBoxMessage.style.marginBottom = "0.5rem"; // spacing above Continue button
        rewardContent.appendChild(firstBoxMessage);
    }

    const btn = document.createElement("button");
    btn.className = "button-39";
    btn.textContent = "Continue";
    btn.onclick = closeReward;
    rewardContent.appendChild(btn);
}

function showNoteReward(noteId) {
    const note = NOTES[noteId];

    const wrapper = document.createElement("div");
    wrapper.className = "note-reveal";

    const title = document.createElement("h2");
    title.textContent = note?.title ?? "Note";

    const text = document.createElement("p");
    text.textContent = note?.text ?? "The note is unreadable.";

    wrapper.appendChild(title);
    wrapper.appendChild(text);
    rewardContent.appendChild(wrapper);
}

// function showCollectibleReward() {
//     const item = document.createElement("div");
//     item.className = "collectible";
//     collection.appendChild(item);

//     const preview = document.createElement("div");
//     preview.className = "collectible";
//     preview.style.width = "96px";
//     preview.style.height = "96px";
//     preview.style.margin = "0 auto 1rem";

//     rewardContent.appendChild(preview);
// }
// function showCollectibleReward(collectibleId) {
//     const c = COLLECTIBLES.find(x => x.id === collectibleId) ?? COLLECTIBLES[0];

//     // Add to collection grid
//     const item = document.createElement("div");
//     item.className = "collectible";


//     const img = document.createElement("img");
//     img.src = c.src;
//     img.alt = c.name;
//     img.loading = "lazy";
//     img.style.width = "100%";
//     img.style.height = "100%";
//     img.style.objectFit = "contain";

//     item.appendChild(img);
//     collection.appendChild(item);

//     // Preview in overlay
//     const previewWrap = document.createElement("div");
//     previewWrap.className = "collectible preview";
//     previewWrap.style.width = "96px";
//     previewWrap.style.height = "96px";
//     previewWrap.style.margin = "0 auto 1rem";

//     const previewImg = document.createElement("img");
//     previewImg.src = c.src;
//     previewImg.alt = c.name;
//     previewImg.style.width = "100%";
//     previewImg.style.height = "100%";
//     previewImg.style.objectFit = "contain";

//     previewWrap.appendChild(previewImg);

//     const label = document.createElement("p");
//     label.textContent = `You've unwrapped a gift. \n\n ${c.name}`;
//     label.style.margin = "0 0 0.75rem";
//     label.style.fontWeight = "600";
//     label.style.textAlign = "center";

//     rewardContent.appendChild(previewWrap);
//     rewardContent.appendChild(label);
// }
function showCollectibleReward(collectibleId) {
    const c = COLLECTIBLES.find(x => x.id === collectibleId) ?? COLLECTIBLES[0];

    // Add to collection grid
    const item = document.createElement("div");
    item.className = "collectible";

    const img = document.createElement("img");
    img.src = c.src;
    img.alt = c.name;

    item.appendChild(img);
    collection.appendChild(item);

    // Preview in overlay
    const previewWrap = document.createElement("div");
    previewWrap.className = "collectible preview";

    const previewImg = document.createElement("img");
    previewImg.src = c.src;
    previewImg.alt = c.name;

    previewWrap.appendChild(previewImg);

    // Title
    const title = document.createElement("h3");
    title.textContent = c.name;
    title.style.textAlign = "center";

    // Custom message
    const message = document.createElement("p");
    message.innerHTML = c.message; // allows bold/italic if desired
    message.style.textAlign = "center";
    message.style.margin = "0.5rem 0 1rem";

    rewardContent.appendChild(previewWrap);
    rewardContent.appendChild(title);
    rewardContent.appendChild(message);
}


function closeReward() {
    overlay.classList.remove("visible");
    transitionBoxes();
}

function transitionBoxes() {
    if (currentIndex >= boxes.length) {
        clickCounter.style.display = "none";
        upgradePanel.style.display = "none";
        endScreen.classList.add("visible");
        stopAutoClicker();
        return;
    }

    centerBox.style.left = "-220px";
    rightBox.classList.replace("right", "center");

    setTimeout(() => {
        game.removeChild(centerBox);
        centerBox = rightBox;
        clicks = 0;
        centerBox.querySelector(".fill").style.height = "0%";
        centerBox.classList.remove("open", "complete");
        centerBox.addEventListener("click", onClickBox);

        currentIndex++;

        // If we’re about to be on the last playable box (the one before the hidden final),
        // do NOT create a right-side preview box.
        const lastPlayableIndex = boxes.length - 2;
        if (currentIndex >= lastPlayableIndex) {
            rightBox = null; // nothing should render on the right
            return;
        }

        rightBox = createBox("right");
    }, 700);
}
function startAutoClicker() {
    if (autoClickIntervalId) return;

    autoClickIntervalId = setInterval(() => {
        // don’t click while reward overlay or intro is up, or if boxes aren’t ready
        if (!centerBox) return;
        if (overlay?.classList?.contains("visible")) return;
        if (endScreen?.classList?.contains("visible")) return;

        // Perform N auto-clicks per tick
        for (let i = 0; i < autoClickLevel; i++) onClickBox();
    }, AUTO_CLICK_TICK_MS);
}

function stopAutoClicker() {
    if (!autoClickIntervalId) return;
    clearInterval(autoClickIntervalId);
    autoClickIntervalId = null;
}

function showUpgradePanel() {
    upgradePanel.style.display = "flex";

    // +1 per click button
    const addBtn = document.createElement("button");
    addBtn.className = "button-39";

    // Double click 10s button
    const doubleBtn = document.createElement("button");
    doubleBtn.className = "button-39";

    // Status span inside double-click button
    const doubleStatus = document.createElement("span");
    doubleStatus.style.marginLeft = "8px";
    doubleStatus.style.fontSize = "0.8rem";
    doubleStatus.style.color = "#007ACC";
    doubleStatus.textContent = "(Inactive)";
    doubleBtn.appendChild(document.createTextNode("Double click 10s ")); // main text
    doubleBtn.appendChild(doubleStatus); // status

    // Auto-click button (optional if you add it later)
    const autoClickBtn = document.createElement("button");
    autoClickBtn.className = "button-39";

    // Costs
    let addClickValueCost = 1;
    let doubleClickCost = 1000;
    let autoClickCost = 2;

    function updateButtons() {
        addBtn.textContent = `+1 per click (Cost: ${addClickValueCost})`;

        // update double click button text
        doubleBtn.firstChild.textContent = `Double click 10s (Cost: ${doubleClickCost})`;

        // only blue when active
        if (doubleActive) {
            doubleStatus.style.color = "#007ACC"; // blue
            doubleStatus.textContent = "(Active)";
        } else {
            doubleStatus.style.color = "#333"; // neutral/gray
            doubleStatus.textContent = "(Inactive)";
        }

        autoClickBtn.textContent = `Auto-click (Cost: ${autoClickCost})`;
        autoClickBtn.textContent = `Auto-click Lv.${autoClickLevel} (Cost: ${autoClickCost})`;
    }

    updateButtons();

    addBtn.onclick = () => {
        if (totalClicks >= addClickValueCost) {
            totalClicks -= addClickValueCost;
            totalClicksPerClick += 1;
            addClickValueCost *= Math.ceil(1.5); // double cost each time
            updateClickCounter();
            updateButtons();
        }
    };

    // doubleBtn.onclick = () => {
    //     if (totalClicks >= doubleClickCost && !doubleActive) {
    //         totalClicks -= doubleClickCost;
    //         clickPower *= 2;
    //         doubleActive = true;
    //         doubleClickCost = 1000; // double the cost each time
    //         updateClickCounter();
    //         updateButtons();

    //         setTimeout(() => {
    //             clickPower /= 2;
    //             doubleActive = false;
    //             updateButtons();
    //         }, 10000);
    //     }
    // };
    autoClickBtn.onclick = () => {
        if (totalClicks < autoClickCost) return;

        totalClicks -= autoClickCost;

        autoClickLevel += 1;               // each purchase adds +1 auto-click per tick
        autoClickCost = Math.ceil(autoClickCost * 2); // scale cost (tune if desired)

        updateClickCounter();
        updateButtons();
        startAutoClicker();
    };

    upgradePanel.appendChild(addBtn);
    // upgradePanel.appendChild(doubleBtn);
    upgradePanel.appendChild(autoClickBtn); // optional

    openBox(); // continue after first box
}

function showFinalOverlay() {
    
    // Hide the box visually
    centerBox.style.display = "none";

    // Stop auto-clicker if running
    if (typeof stopAutoClicker === "function") {
        stopAutoClicker();
    }

    // Show your existing end screen / overlay
    endScreen.classList.add("visible");
}
// --- DEV MODE BUTTON ---
const devBtn = document.createElement("button");
devBtn.className = "button-39";
devBtn.textContent = "DEV MODE: +100,000,000 per click";

devBtn.onclick = () => {
    totalClicksPerClick += 100000000;
    updateClickCounter();
};



upgradePanel.appendChild(devBtn);

const introOverlay = document.getElementById("intro-overlay");
setTimeout(() => {
    introOverlay.style.transition = "opacity 1s ease";
    introOverlay.style.opacity = 0;

    setTimeout(() => {
        introOverlay.style.display = "none";
        setupBoxes();
    }, 1000);

}, 1500);
// --- Intro fade ---

