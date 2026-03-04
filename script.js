

const NOTES = {
    2: {
        title: "Memory",
        text: "When I first saw you it was on a computer screen: during covid and over Zoom. I think I eventually told you that I would pin your webcam window and study your eyes while Jackie talked. \n\n I felt like I knew you, though we hadn't really even spoken yet. It was as though a future meaning too immense for time was spilling back into the present. \n \nThe Japanese call this Koi No Yokan. "
    },
    4: {
        title: "Memory",
        text: "We met a year later. I told you I recognized you by your eyes because you were wearing a mask. I didn’t mention all the staring I did over Zoom that made recognition so easy. Or the unexplained intensities I felt when I looked at you. "
    },
    6: {
        title: "Memory",
        text: "When we became friends it felt like the right hand grasping the left. I had so much to say to you, almost like I had found something lost. One night, overlooking the city, you drew shapes in the fog of my car windshield. I left them there. I was in love with you. \n \n I love my friends, I thought."
    },
    8: {
        title: "Memory",
        text: "Early in our friendship we went to the Cheesecake Factory together. Because we’re both so ironic and down for an ironic good time. I wanted to seem spontaneous. Maybe you did too? I discovered you were a vegetarian that night: a badly disciplined vegetarian."
    },
    10: {
        title: "Memory",
        text: "Once, when we were driving together and talking about male feminists or sex politics or something, you told me you were “anti-giving-men-what-they-want.” I was quiet, amused and hoping you’d elaborate. Maybe you thought I took offense so you hedged, “I mean, I know we’re all just horny babies at the end of the day.” Maybe I should have taken some offense, but I was always on your side. \n\n “Who am I to you?” I thought, worried you could sense some disallowed intention in me, suppressed."
    },
    12: {
        title: "Memory",
        text: "When it was very cold once, and more than once, we went to the labyrinth next to the Presbyterian church. A place of quiet contemplation. We walked the labyrinth together and I talked the whole time. "
    },
    14: {
        title: "Memory",
        text: "When I helped you move, I saw the inside of your room. It was half-empty, almost vacant. You were already elsewhere: re-rooting yourself in another space. I had sometimes pictured you in that room. Something I’d imagined but knew I’d never have license to see. Not so sacred as behind the tabernacle, but just as pre-occupying. "
    },
    16: {
        title: "Memory",
        text: "You told me you were going to rehab. \n \n You told me I was important to you. \n \n Two surprises. "
    },
    18: {
        title: "Memory",
        text: "How many times did I tell you I love you without ever really saying it? \n \n “Of course you understand what I mean.” “You’re my best friend.” “I fall in love with everyone.” (you’re everyone) “I was going to call you beautiful but I got nervous.” “I just don’t expect people who look like you to think like you.” \n \n You know I tried not to say the wrong thing, to say too much. To say it out loud. "
    },
    20: {
        title: "Recieved Note",
        text: "Effort compounds.\nSo does commitment."
    },
    // add more as needed
};

const COLLECTIBLES = [
    { id: "can", name: "Diet Coke", src: "./assets/can.png", message: "Now available in 8 ounce cans. You can probably guess why it doesn't actually say Coke on the can." },
    { id: "leash", name: "Leash", src: "./assets/leash.png", message: "I added this object early in development and have since forgotten why. Mystery abounds. Definitely nothing weird though." },
    { id: "shrimp", name: "Shrimp", src: "./assets/shrimp.png", message: "The evils of shellfish consumption are balanced by their nutritional selenium content. You can click on the objects up there, by the way." },
    { id: "phone", name: "Phone", src: "./assets/phone.png", message: "A mutual favorite: the phone. Please tell me you aren't playing this on a phone. Can you even read this?" },
    { id: "key", name: "My Apartment Key", src: "./assets/key.png", message: "Are we moving too fast? No. Never were." },
    { id: "gift", name: "Gift Box", src: "./assets/chest.png", message: "That's weird. There was another, smaller one inside." },
    { id: "apartment", name: "Aerial View of The Apartment", src: "./assets/apartment.png", message: "The photo I had made was a little more zoomed out than I would have hoped." },
    { id: "us", name: "Us", src: "./assets/us.png", message: "An artist's rendition of youngsters in love." },
    // add more...


];



let collectibleIndex = 0; // tracks which one to award next


// --- Balance targets (accounts for upgrades; DEV excluded) ---
const BOX_COUNT = 20;

// You end on index boxes.length - 2, so playable boxes are 0..18 (19 boxes).
const PLAYABLE_BOXES = BOX_COUNT - 1;

// Target: ~10 minutes at ~4 manual clicks/sec
const TARGET_SECONDS_TOTAL = 417;
const ASSUMED_CLICKS_PER_SEC = 4;

// Exception: first box stays tiny
const BOX0_REQUIRED_CLICKS = 5;

// We distribute remaining time across boxes 1..18, increasing slightly each box.
const FIRST_AFTER_BOX_SECONDS = 3;

// This multiplier compensates for the fact that players will continuously buy upgrades
// (+1 per click cost doubles; auto-click cost doubles), which greatly increases throughput.
// Tunable knob: raise to make longer, lower to make shorter.
const REQUIREMENT_MULTIPLIER = 24;

const AFTER_BOX_COUNT = PLAYABLE_BOXES - 1; // boxes 1..18 (18 boxes)
const remainingSeconds =
    TARGET_SECONDS_TOTAL - (BOX0_REQUIRED_CLICKS / ASSUMED_CLICKS_PER_SEC);

const stepSeconds =
    (2 * remainingSeconds / AFTER_BOX_COUNT - 2 * FIRST_AFTER_BOX_SECONDS) /
    (AFTER_BOX_COUNT - 1);

const boxes = Array.from({ length: BOX_COUNT }, (_, i) => {
    let reward;

    if (i === 0) {
        reward = { type: "upgrade" };
    } else if ((i + 1) % 2 === 0) {
        reward = { type: "note", id: i + 1 };
    } else {
        const c = COLLECTIBLES[collectibleIndex % COLLECTIBLES.length];
        reward = { type: "collectible", index: collectibleIndex };
        collectibleIndex++;
    }

    let clicksRequired;

    if (i === 0) {
        clicksRequired = BOX0_REQUIRED_CLICKS; // exception
    } else {
        // Map i=1..18 to j=0..17 for the post-first-box ramp
        const j = Math.min(i - 1, AFTER_BOX_COUNT - 1);
        const secondsForBox = FIRST_AFTER_BOX_SECONDS + j * stepSeconds;

        clicksRequired = Math.max(
            5,
            Math.round(secondsForBox * ASSUMED_CLICKS_PER_SEC * REQUIREMENT_MULTIPLIER)
        );
    }

    return { clicksRequired, reward };
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

// --- Collection selection / info panel ---
let selectedCollectibleEl = null;

function ensureCollectionInfoPanel() {
    let panel = document.getElementById("collection-info");
    if (panel) return panel;

    panel = document.createElement("div");
    panel.id = "collection-info";
    panel.className = "hidden";

    const title = document.createElement("h3");
    title.id = "collection-info-title";

    const msg = document.createElement("div");
    msg.id = "collection-info-message";

    panel.appendChild(title);
    panel.appendChild(msg);

    // Put it on top of the game UI
    document.body.appendChild(panel);

    // Close when clicking outside (optional but nice)
    document.addEventListener("click", (e) => {
        const clickedInsideCollection = collection?.contains(e.target);
        const clickedInsidePanel = panel.contains(e.target);
        if (!clickedInsideCollection && !clickedInsidePanel) {
            clearSelectedCollectible();
        }
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") clearSelectedCollectible();
    });

    return panel;
}

function clearSelectedCollectible() {
    if (selectedCollectibleEl) selectedCollectibleEl.classList.remove("selected");
    selectedCollectibleEl = null;

    const panel = document.getElementById("collection-info");
    if (panel) panel.classList.add("hidden");
}

function selectCollectibleElement(el, collectible) {
    const panel = ensureCollectionInfoPanel();

    // Toggle off if clicking the same item again
    if (selectedCollectibleEl === el) {
        clearSelectedCollectible();
        return;
    }

    if (selectedCollectibleEl) selectedCollectibleEl.classList.remove("selected");
    selectedCollectibleEl = el;
    el.classList.add("selected");

    const title = document.getElementById("collection-info-title");
    const msg = document.getElementById("collection-info-message");
    if (title) title.textContent = collectible?.name ?? "Item";
    if (msg) msg.innerHTML = collectible?.message ?? "";

    panel.classList.remove("hidden");
}

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

    updateProgressUIAndHandleCompletion();
}

let refreshUpgradeButtons = null;

function updateClickCounter() {
    clickCounter.textContent = `Bank: ${Math.floor(totalClicks)}`;
    if (typeof refreshUpgradeButtons === "function") refreshUpgradeButtons();
}

function openBox() {
    centerBox.classList.add("open");
    setTimeout(showReward, 400);
}

function showKoiNoYokanTitle() {
    if (document.getElementById("koi-title")) return;

    const title = document.createElement("h1");
    title.id = "koi-title";
    title.textContent = "Koi No Yokan";

    // put it inside the game container
    game.appendChild(title);

    // force initial computed style to apply
    title.getBoundingClientRect();

    // trigger transition
    title.classList.add("show");
}

function showReward() {
    const reward = boxes[currentIndex].reward;
    if (currentIndex === 1) {
        showKoiNoYokanTitle();
    }
    overlay.classList.add("visible");
    rewardContent.innerHTML = "";

    if (reward.type === "note") {
        showNoteReward(reward.id);
    }

    if (reward.type === "collectible") {
        showCollectibleReward(reward.index);
    }

    if (currentIndex === 0) {
        const firstBoxMessage = document.createElement("p");
        firstBoxMessage.textContent = "You unlocked a couple upgrades to buy. Also, try to catch hearts for a bonus! \n\nTo be honest, the hearts thing sort of becomes the game after a certain point. Balancing is hard.";
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

function showCollectibleReward(collectibleIndex) {
    const c = COLLECTIBLES[collectibleIndex] ?? COLLECTIBLES[0];

    // Add to collection grid (clickable + selectable)
    const item = document.createElement("div");
    item.className = "collectible selectable";
    item.dataset.collectibleId = c.id;

    const img = document.createElement("img");
    img.src = c.src;
    img.alt = c.name;
    item.appendChild(img);

    item.addEventListener("click", (e) => {
        e.stopPropagation(); // prevents the document click handler from immediately closing it
        selectCollectibleElement(item, c);
    });

    collection.appendChild(item);

    // Preview in overlay (keep your existing behavior)
    const previewWrap = document.createElement("div");
    previewWrap.className = "collectible preview";
    const previewImg = document.createElement("img");
    previewImg.src = c.src;
    previewImg.alt = c.name;
    previewWrap.appendChild(previewImg);

    const title = document.createElement("h3");
    title.textContent = c.name;
    title.style.textAlign = "center";

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

function updateProgressUIAndHandleCompletion() {
    const required = boxes[currentIndex].clicksRequired;
    const progress = Math.min(clicks / required, 1);
    centerBox.querySelector(".fill").style.height = `${progress * 100}%`;

    if (progress >= 1) {
        centerBox.classList.add("complete");
        centerBox.removeEventListener("click", onClickBox);

        setTimeout(() => {

            const isFinalBox = currentIndex === boxes.length - 2;
            if (isFinalBox) {
                showFinalOverlay();
                return;
            }

            if (currentIndex === 0) showUpgradePanel();
            else openBox();
        }, 600);
    }
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


    refreshUpgradeButtons = updateButtons;

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
    upgradePanel.appendChild(autoClickBtn); // optional



    openBox(); // continue after first box
}
const boostEl = document.getElementById("boost");
let boostActive = false;
let boostHideTimer = null;
let boostNextTimer = null;

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function scheduleNextBoost() {
    if (boostNextTimer) clearTimeout(boostNextTimer);
    const delay = randInt(8000, 16000); // 8–16s
    boostNextTimer = setTimeout(showBoost, delay);
}

function showBoost() {
    // Don’t show if reward/end overlays are up, or if no active center box
    if (!centerBox || boostActive) {
        scheduleNextBoost();
        return;
    }

    boostActive = true;
    boostEl.classList.remove("hidden");
    boostEl.textContent = "❤";

    // Position: avoid the top strip (collection) and screen edges
    const pad = 16;
    const topSafe = 90;       // keep away from collection area
    const bottomSafe = 24;

    const w = boostEl.offsetWidth || 56;
    const h = boostEl.offsetHeight || 56;

    const x = randInt(pad, Math.max(pad, window.innerWidth - w - pad));
    const y = randInt(topSafe, Math.max(topSafe, window.innerHeight - h - bottomSafe));

    boostEl.style.left = `${x}px`;
    boostEl.style.top = `${y}px`;

    // Auto-hide after a short time if not clicked
    if (boostHideTimer) clearTimeout(boostHideTimer);
    boostHideTimer = setTimeout(hideBoost, randInt(1500, 2400)); // 2.5–4s
}

function hideBoost() {
    boostActive = false;
    boostEl.classList.add("hidden");
    scheduleNextBoost();
}

boostEl.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!boostActive) return;

    // Bonus scales with current box requirement (feels relevant throughout)
    const required = boxes[currentIndex].clicksRequired;
    const bonus = Math.max(10, Math.ceil(required * 0.12)); // 12% of requirement, min 10

    clicks += bonus;
    totalClicks += bonus;
    updateClickCounter();

    // Update fill + handle completion (same flow as normal clicks)
    updateProgressUIAndHandleCompletion();

    hideBoost();
});

// Start the boost cycle once the game is running
scheduleNextBoost();

function showFinalOverlay() {

    // Hide the box visually
    centerBox.style.display = "none";

    // Stop auto-clicker if running
    if (typeof stopAutoClicker === "function") {
        stopAutoClicker();
    }

    // Show your existing end screen / overlay
    endScreen.classList.add("visible");
    const finalSound = document.getElementById("final-sound");
    finalSound.addEventListener("ended", () => {
        location.reload();
    });
    setTimeout(() => {
        if (finalSound.paused) {
            finalSound.currentTime = 0;
            finalSound.play();
        }
    }, 5000);



}
// --- DEV MODE BUTTON ---
// const devBtn = document.createElement("button");
// devBtn.className = "button-39";
// devBtn.textContent = "DEV MODE: +100,000,000 per click";

// devBtn.onclick = () => {
//     totalClicksPerClick += 100000000;
//     updateClickCounter();
// };

const DEV_MODE = false;

if (DEV_MODE) {
  const devBtn = document.createElement("button");
  devBtn.className = "button-39";
  devBtn.textContent = "DEV MODE: +100,000,000 per click";
  devBtn.onclick = () => {
    totalClicksPerClick += 100000000;
    updateClickCounter();
  };
  upgradePanel.appendChild(devBtn);
}



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

