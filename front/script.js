document.getElementById("gift-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const errorEl = document.getElementById("error");
    const loadingEl = document.getElementById("loading");
    const resultsContainer = document.getElementById("gift-cards");
    errorEl.textContent = "";
    resultsContainer.innerHTML = "";

    const form = e.target;
    const interests = Array.from(form.elements["interests"])
        .filter((el) => el.checked)
        .map((el) => el.value);

    const age = parseInt(form.elements["age"].value);
    const gender = form.elements["gender"].value;
    const ai = form.elements["ai"].value;

    // Валидация
    if (interests.length < 1) {
        errorEl.textContent = "Выберите 1-2 интереса.";
        return;
    }

    if (isNaN(age) || age <= 0 || age > 100) {
        errorEl.textContent = "Введите корректный возраст, не меньше 0 и не больше 100.";
        return;
    }

    if (!gender) {
        errorEl.textContent = "Выберите пол.";
        return;
    }

    if (!ai) {
        errorEl.textContent = "Выберите ИИ."
    }

    loadingEl.style.display = "block";

    try {
        const response = await fetch("http://localhost:3000/api/recommend-gift", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ interests, age, gender, ai }),
        });

        const res = await response.json();
        console.log("🚀 ~ data:", res)

        const data = res.data;

        if (Array.isArray(data) && data.length > 0) {
            data.forEach((product) => {
                const card = document.createElement("div");
                card.className = "card";

                card.innerHTML = `
          <img src="${product.imageUrl || "https://via.placeholder.com/200x150"}" alt="gift" />
          <div class="card-body">
            <h3>${product.name}</h3>
            <p>Цена: ${product.price}</p>
            <p>Категория: ${product.interest_category}</p>
          </div>
        `;

                resultsContainer.appendChild(card);
            });
            errorEl.textContent = res.status === "warning" ? res.message : "";
        } else {
            resultsContainer.innerHTML = "<p>Ничего не найдено по заданным параметрам.</p>";
        }
    } catch (err) {
        errorEl.textContent = "Ошибка при получении данных с сервера.";
        console.error(err);
    } finally {
        loadingEl.style.display = "none";
    }
});
