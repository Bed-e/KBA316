const app = document.getElementById("app");
const colorPicker = document.getElementById("color-picker");

// Create the color picker sliders dynamically
function createColorPicker() {
  const colors = ["red", "green", "blue", "alpha"];
  const container = document.createElement("div");
  container.classList.add("slider-container");

  colors.forEach((color) => {
    const label = document.createElement("label");
    label.innerText = `${color.charAt(0).toUpperCase() + color.slice(1)}: `;

    const slider = document.createElement("input");
    slider.type = "range";
    slider.id = color;
    slider.min = "0";
    slider.max = "255";
    slider.value = color === "alpha" ? "255" : "128";

    label.appendChild(slider);
    container.appendChild(label);

    slider.addEventListener("input", () => updateCircleColor(mouseCircle));
  });

  // Add slider for circle size
  const sizeLabel = document.createElement("label");
  sizeLabel.innerText = "Size: ";
  const sizeSlider = document.createElement("input");
  sizeSlider.type = "range";
  sizeSlider.id = "size";
  sizeSlider.min = "10";
  sizeSlider.max = "100";
  sizeSlider.value = "25";
  sizeLabel.appendChild(sizeSlider);
  container.appendChild(sizeLabel);

  sizeSlider.addEventListener("input", () => {
    mouseCircle.style.width = `${sizeSlider.value}px`;
    mouseCircle.style.height = `${sizeSlider.value}px`;
  });

  colorPicker.appendChild(container);

  // Add message for hotkey 'p'
  const hotkeyMessage = document.createElement("p");
  hotkeyMessage.innerText = "Press 'p' to toggle color picker";
  hotkeyMessage.style.marginTop = "10px";
  hotkeyMessage.style.color = "#fff";
  colorPicker.appendChild(hotkeyMessage);
}

// Call the function to create color pickers
createColorPicker();

// Create the initial circle to be attached to the mouse.
const mouseCircle = createCircle();
app.appendChild(mouseCircle);

// Helper function for making circles.
function createCircle() {
  const circle = document.createElement("div");
  circle.classList.add("circle");
  circle.style.width = "25px"; // Initial size
  circle.style.height = "25px"; // Initial size
  updateCircleColor(circle);
  return circle;
}

// Helper function for placing circles.
function placeCircle(container) {
  const copy = mouseCircle.cloneNode(true);
  copy.style.position = "absolute";
  copy.style.top = mouseCircle.style.top;
  copy.style.left = mouseCircle.style.left;
  container.appendChild(copy);
}

// Update the circle's color based on the slider values.
function updateCircleColor(circle) {
  const red = parseInt(document.getElementById("red").value);
  const green = parseInt(document.getElementById("green").value);
  const blue = parseInt(document.getElementById("blue").value);
  const alpha = parseInt(document.getElementById("alpha").value);
  const color = `rgba(${red}, ${green}, ${blue}, ${alpha / 255})`;
  circle.style.backgroundColor = color;
  colorPicker.style.backgroundColor = color;

  // Check condition for text color change
  const sumRG = red + green;
  const textColor = sumRG > 450 || alpha < 128 ? "#000" : "#fff";

  // Update text color of all elements inside #color-picker
  const colorPickerElements = document.querySelectorAll(
    "#color-picker, #color-picker *"
  );
  colorPickerElements.forEach((element) => {
    element.style.color = textColor;
  });
}

// Variable to track whether the mouse is pressed down.
let isDrawing = false;

// Store all brush strokes in an array
const brushStrokes = [];
let currentStroke;

// Create a new container for each brush stroke
function startNewStroke() {
  const strokeContainer = document.createElement("div");
  strokeContainer.classList.add("brush-stroke");
  app.appendChild(strokeContainer);
  brushStrokes.push(strokeContainer);
  return strokeContainer;
}

// Create a "painting" effect with pointerdown
// and pointerup. Cache the interval for cancelling.
let paintInterval;
function handleStart(event) {
  event.preventDefault();
  isDrawing = true;
  currentStroke = startNewStroke();
  placeCircle(currentStroke); // Initial placement
  paintInterval = setInterval(() => {
    if (isDrawing) {
      placeCircle(currentStroke);
    }
  }, 10);
}

function handleEnd(event) {
  event.preventDefault();
  isDrawing = false;
  clearInterval(paintInterval);
  setTimeout(() => updateCircleColor(mouseCircle), 0);
}

// Stop drawing if the cursor leaves the viewport.
function handlePointerLeave(event) {
  isDrawing = false;
  clearInterval(paintInterval);
}

// Undo the last brush stroke
function undoLastBrushStroke() {
  if (brushStrokes.length > 0) {
    const lastStroke = brushStrokes.pop();
    app.removeChild(lastStroke);
  }
}

// Toggle color picker visibility with the 'p' key.
document.addEventListener("keydown", (event) => {
  if (event.key === "p") {
    colorPicker.style.display =
      colorPicker.style.display === "none" ? "flex" : "none";
  } else if (event.key === "z") {
    undoLastBrushStroke();
  }
});

// Moves the mouse circle alongside the mouse.
function handleMove(event) {
  event.preventDefault();
  const size = mouseCircle.offsetWidth / 2;
  mouseCircle.style.top = `${event.clientY - size}px`;
  mouseCircle.style.left = `${event.clientX - size}px`;
}

// Register events!
app.addEventListener("pointerdown", handleStart);
app.addEventListener("pointerup", handleEnd);
app.addEventListener("pointermove", handleMove);
document.addEventListener("pointerleave", handlePointerLeave);
