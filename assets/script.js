let secret = Math.floor(Math.random()*100) + 1;

function guess() {
  let value = document.getElementById("input").value;

  if (value == secret) {
    document.getElementById("msg").innerText = "🎉 Correcto!";
  } else if (value < secret) {
    document.getElementById("msg").innerText = "🔼 Más alto";
  } else {
    document.getElementById("msg").innerText = "🔽 Más bajo";
  }
}

function goBack() {
  window.location.href = "../../apps.html";
}