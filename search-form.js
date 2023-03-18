class SearchForm extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const shadow = this.attachShadow({mode: 'open'});

    this.innerHTML = ''

    const wrapper = document.createElement("form");
    wrapper.setAttribute("class", "wrapper");

    const companyDiv = document.createElement("div");
    companyDiv.setAttribute("class", "company");
    companyDiv.textContent = 'Компания или ИП'

    const autocomplete = document.createElement("input");
    autocomplete.setAttribute("type", "text");
    autocomplete.setAttribute("class", "autocomplete");
    autocomplete.setAttribute("placeholder", "Введите название, ИНН, ОГРН или адрес организации");
    autocomplete.setAttribute("autocomplete", "off");

    const ulElem = document.createElement("ul");
    ulElem.setAttribute("id", "results");

    const resultDiv = document.createElement("div");
    resultDiv.setAttribute("class", "result");

    const organizationType = document.createElement("div");
    organizationType.setAttribute("class", "organization_type");

    const divRow1 = document.createElement("div");
    divRow1.setAttribute("class", "row");
    const label1 = document.createElement("label");
    label1.textContent='Краткое наименование'
    const inputShortName = document.createElement("input");
    divRow1.appendChild(label1)
    divRow1.appendChild(inputShortName)

    const divRow2 = document.createElement("div");
    divRow2.setAttribute("class", "row");
    const label2 = document.createElement("label");
    label2.textContent='Полное наименование'
    const inputFullName = document.createElement("input");
    divRow2.appendChild(label2)
    divRow2.appendChild(inputFullName)

    const divRow3 = document.createElement("div");
    divRow3.setAttribute("class", "row");
    const label3 = document.createElement("label");
    label3.textContent='ИНН / КПП'
    const inputInnKpp = document.createElement("input");
    divRow3.appendChild(label3)
    divRow3.appendChild(inputInnKpp)

    const divRow4 = document.createElement("div");
    divRow4.setAttribute("class", "row");
    const label4 = document.createElement("label");
    label4.textContent='Адрес'
    const inputAdress = document.createElement("input");
    divRow4.appendChild(label4)
    divRow4.appendChild(inputAdress)

    resultDiv.appendChild(organizationType)
    resultDiv.appendChild(divRow1)
    resultDiv.appendChild(divRow2)
    resultDiv.appendChild(divRow3)
    resultDiv.appendChild(divRow4)

    shadow.appendChild(wrapper)
    wrapper.appendChild(companyDiv)
    wrapper.appendChild(autocomplete)
    wrapper.appendChild(ulElem)
    wrapper.appendChild(resultDiv)

    const style = document.createElement("style");
    style.textContent = `

      .wrapper {
        padding:20px;
      }

      .company {
        font-weight: bold;;
      }
      
      .result {
        width: 50%;
        min-width: 300px;
      }
      
      input {
        font-size: 16px;
        padding: 4px;
      }
      
      .row {
        margin-top: 1em;
      }
      
      .row input, .row textarea {
        width: 100%;
      }
      
      .autocomplete {
        width:100%
      }
      
      .show_results {
        border: 1px solid black;
        max-height: 150px;
        overflow-y: scroll;
      }
      
      .hide_results {
        border: none
      }
      
      .item_li {
        margin: 5px 0px;
      } 
      
      a {
        padding: 5px;
        color:black;
        text-decoration: none;
      }
      
      a:focus, a:hover {
        background-color: gainsboro;
      }`;

      shadow.appendChild(style);

  autocomplete.addEventListener('input', async(e) => {
    const inputValue = e.target.value
    ulElem.textContent = "";
    ulElem.innerHTML = "";

    ulElem.replaceChildren()

    organizationType.textContent=''

    ulElem?.classList.remove('show_results')

    inputShortName.value = ""
    inputFullName.value = ""
    inputInnKpp.value = ""
    inputAdress.value = ""

      
    if (inputValue.length > 0) {
      ulElem.classList.add('show_results')
      ulElem.classList.remove('hide_results')

      SearchForm.globalResult = await this.getCompaniesInfo(inputValue)

      if (!SearchForm.globalResult.suggestions.length) {
        ulElem.classList.remove('show_results')
        ulElem.classList.add('hide_results')
      }

      ulElem.style.display = "block";

      for (let i = 0; i < SearchForm.globalResult.suggestions.length; i++) {
        const liItem = document.createElement("li");
        liItem.classList.add('item_li')
        liItem.innerHTML=`<a href="#"> ${SearchForm.globalResult.suggestions[i].value} </a>`

        ulElem.appendChild(liItem)

      }
    }

  })


    ulElem.onclick = function (event) {
      ulElem.classList.add('hide_results')
      const choosenCompanyName = event.target.innerText;
      autocomplete.value = choosenCompanyName;
      this.innerHTML = "";
      const choosenCompany = SearchForm.globalResult.suggestions.find(company=>company.value = choosenCompanyName)

      inputShortName.value = choosenCompanyName
      inputFullName.value = choosenCompany.data.name.full_with_opf
      inputInnKpp.value = `${choosenCompany.data.inn} / ${choosenCompany.data.kpp}`
      inputAdress.value = choosenCompany.data.address.value
      organizationType.textContent=`Организация (${choosenCompany.data.type})`
    };
  }

  async getCompaniesInfo(query){
    const options = {
      method: "POST",
      mode: "cors",
      headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": "Token " + SearchForm.token
      },
      body: JSON.stringify({query: query})
  }

    try {
      const response = await fetch(SearchForm.url, options)
      const responseJson = response.json()
      return responseJson
    }

    catch(e){}
  }

  static globalResult = null;
  static url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party";
  static API_KEY = "98d9aa9c8852c23159f1bf387e8a89c2834b6d27"
  static token = `${SearchForm.API_KEY}`;
}

customElements.define("search-form", SearchForm);
