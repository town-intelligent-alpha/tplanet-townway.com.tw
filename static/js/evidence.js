$(document).ready(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const uuid = urlParams.get("uuid");

  if (uuid) {
    $.ajax({
      url: `${HOST_URL_TPLANET_DAEMON}/projects/get_sroi_evidence_identifiers`,
      type: "POST",
      data: {
        uuid_project: uuid,
      },
      success: (response) => {
        $("#SOCIAL").html(`<ul>
          ${response.SOCIAL.map(
            (item) =>
              `<div class='d-flex justify-content-between align-items-center'><li class="mr-5">${item.id}${item.name}</li><input class="form-control w-50 my-2" type="text" placeholder="請填入可檢視雲端連結" /></div>`
          ).join("")}
          </ul>`);
        $("#ECONOMY").html(`<ul>
          ${response.ECONOMY.map(
            (item) =>
              `<div class='d-flex justify-content-between align-items-center'><li class="mr-5">${item.id}${item.name}</li><input class="form-control w-50 my-2" type="text" placeholder="請填入可檢視雲端連結" /></div>`
          ).join("")}
          </ul>`);
        $("#ENVIRONMENT").html(`<ul>
          ${response.ENVIRONMENT.map(
            (item) =>
              `<div class='d-flex justify-content-between align-items-center'><li class="mr-5">${item.id}${item.name}</li><input class="form-control w-50 my-2" type="url" placeholder="請填入可檢視雲端連結" /></div>`
          ).join("")}
          </ul>`);

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
          "uuid_project": uuid
        });

        const requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow"
        };

        fetch(`${HOST_URL_TPLANET_DAEMON}/projects/get_sroi_evidences`, requestOptions)
          .then((response) => response.json())
          .then((result) => {
            if (result.status === "OK") {
              result.content.forEach((item) => {
                const [id, name] = item.id.split(/(.+)/); // 將 id 和 name 分開
                const selector = `li:contains('${id}${name}')`;
                const input = $(selector).siblings("input.form-control");
                input.val(item.reference);
              });
            } else {
              console.error(result.error);
            }
          })
          .catch((error) => console.error(error));
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  $("a.btn-dark").attr("href", "cms_sroi.html?uuid=" + uuid);

  $("#save-btn").on("click", () => {
    var sroi_evidences = [];
    $("input.form-control").each(function () {
      const value = $(this).val();
      if (value != "") {
        sroi_evidences.push({
          id: $(this).siblings("li").text(),
          reference: value,
        });
      }
    });
    const requestData = {
      uuid_project: uuid,
      sroi_evidences: sroi_evidences,
    };
    $.ajax({
      url: `${HOST_URL_TPLANET_DAEMON}/projects/set_sroi_evidences`,
      type: "POST",
      data: JSON.stringify(requestData),
      contentType: "application/json",
      success: (response) => {
        alert("儲存成功");
        window.location.href = "cms_sroi.html?uuid=" + uuid;
      },
      error: (error) => {
        console.log(error);
      },
    });
  });

  const btn = document.querySelector(".show-more-btn");
  const content = document.querySelector(".content");
  const filter = document.querySelector(".filter");
  btn.addEventListener("click", () => {
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
      btn.textContent = "顯示更多";
      filter.style.visibility = "visible";
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
      btn.textContent = "隱藏";
      filter.style.visibility = "hidden";
    }
  });
});