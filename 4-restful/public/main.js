const getData = document.querySelector("#get-data")
const display = document.querySelector("#display")
getData.addEventListener('click',getPets)

async function getPets(){
  const res = await fetch('/pets');
  const data = await res.json();
  data.forEach((pet)=>{
    const petDiv = document.createElement('div');
    petDiv.textContent = pet.name
    display.appendChild(petDiv)
  })

}