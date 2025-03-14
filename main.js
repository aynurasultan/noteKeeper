const months = [
  "January", "February", "March", "April", "May", "June", "July", "August", 
  "September", "October", "November", "December"
];

const addBox = document.querySelector(".add-box");
const popupBoxContainer = document.querySelector(".popup-box");
const popupBox = document.querySelector(".popup");
const closeBtn = document.querySelector("#close-btn");
const form = document.querySelector("form");
const wrapper = document.querySelector(".wrapper");

let notes = JSON.parse(localStorage.getItem("notes")) || [];
let isEditing = false;
let editId = null;

document.addEventListener("DOMContentLoaded", () => {
  renderNotes(notes);
});

// Not ekleme kutusuna tıklama işlemi
addBox.addEventListener("click", () => {
  popupBoxContainer.classList.add("show");
  popupBox.classList.add("show");
  document.querySelector("body").style.overflow = "hidden";
});

// Kapatma butonuna tıklama işlemi
closeBtn.addEventListener("click", () => {
  popupBoxContainer.classList.remove("show");
  popupBox.classList.remove("show");
  document.querySelector("body").style.overflow = "auto";
});

// Not ekleme ve düzenleme işlemi
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const titleInput = e.target[0];
  const descriptionInput = e.target[1];
  let title = titleInput.value.trim();
  let description = descriptionInput.value.trim();

  // Başlık veya açıklama boşsa uyarı ver ve işlemi durdur
  if (!title || !description) {
    alert("Lütfen formdaki gerekli kısımları doldurunuz!");
    return;
  }

  const date = new Date();
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const id = date.getTime();

  // Yeni not veya düzenleme işlemi
  if (isEditing) {
    notes = notes.map((note) =>
      note.id === editId ? { ...note, title, description } : note
    );
    isEditing = false;
    editId = null;
  } else {
    let noteInfo = { id, title, description, date: `${month} ${day}, ${year}` };
    notes.push(noteInfo);
  }

  // Güncellenmiş veriyi LocalStorage'a kaydet
  localStorage.setItem("notes", JSON.stringify(notes));

  // Notları tekrar ekrana yazdır
  renderNotes();

  // Formu kapat ve sıfırla
  form.reset();
  popupBoxContainer.classList.remove("show");
  popupBox.classList.remove("show");
  document.querySelector("body").style.overflow = "auto";
});

// Notları render etme fonksiyonu
function renderNotes() {
  document.querySelectorAll(".note").forEach((li) => li.remove());
  notes.forEach((note) => {
    let noteElement = `
      <li class="note" data-id='${note.id}'>
        <div class="details">
          <p class="title">${note.title}</p>
          <p class="description">${note.description}</p>
        </div>
        <div class="bottom">
          <span>${note.date}</span>
          <div class="settings">
            <i class="bx bx-dots-horizontal-rounded"></i>
            <ul class="menu">
              <li class="edit"><i class='bx bx-edit'></i> Düzenle</li>
              <li class="delete"><i class='bx bx-trash-alt'></i> Sil</li>
            </ul>
          </div>
        </div>
      </li>`;
    addBox.insertAdjacentHTML("afterend", noteElement);
  });
}

// Menü açma-kapama ve not silme/düzenleme işlemleri
wrapper.addEventListener("click", (e) => {
  if (e.target.classList.contains("bx-dots-horizontal-rounded")) {
    const parentElement = e.target.parentElement;
    parentElement.classList.add("show");

    // Menü dışına tıklanınca kapama
    document.addEventListener("click", function closeMenu(event) {
      if (!event.target.closest(".settings")) {
        parentElement.classList.remove("show");
        document.removeEventListener("click", closeMenu);
      }
    });
  }

  // Not Silme
  if (e.target.closest(".delete")) {
    const noteElement = e.target.closest(".note");

    if (!noteElement) return; // Eğer not bulunamazsa işlemi durdur

    const noteId = parseInt(noteElement.dataset.id, 10); // ID'yi al ve sayıya çevir

    // Kullanıcıya onay sorusu sor
    const confirmDelete = confirm("Bu notu silmek istediğinize emin misiniz?");
    
    if (!confirmDelete) return; // Kullanıcı iptal ederse işlemi durdur

    // `notes` dizisini güncelle (Seçili olan notu kaldır)
    notes = notes.filter((note) => note.id !== noteId);
    localStorage.setItem("notes", JSON.stringify(notes)); // Güncellenmiş diziyi sakla

    // Notu ekrandan kaldır
    noteElement.remove();
  }

  // Not Düzenleme
  if (e.target.closest(".edit")) {
    const noteElement = e.target.closest(".note");
    if (!noteElement) return;

    const noteId = parseInt(noteElement.dataset.id, 10);
    const noteToEdit = notes.find((note) => note.id === noteId);

    // Formu aç ve mevcut bilgileri yerleştir
    popupBoxContainer.classList.add("show");
    popupBox.classList.add("show");
    document.querySelector("body").style.overflow = "hidden";

    form[0].value = noteToEdit.title; // Başlık
    form[1].value = noteToEdit.description; // Açıklama

    isEditing = true;
    editId = noteId;
  }
});
