
//instantiating DOMs
var submit_button = document.getElementById("submit_button")
submit_button.addEventListener("click", submit)
var input_text = document.getElementById("food_input")

//pexels stuff (image api)
//const client = createClient('CScYg9eYcncfbOvO2hUze7LZLNKsNyi08zQax9rklFlnuWQcVEIf1xBZ');


//instantiating api url with a blank query
//var api_url = "https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=";
//var api_url = "https://api.nal.usda.gov/fdc/v1/food/769010?api_key=DEMO_KEY";

var api_url = "https://api.nal.usda.gov/fdc/v1/food/";

//declaring the massive nutrient info file (reference cheddar cheese.json)
var nutrient_file;
var nutIds = [1062, 1079, 1093, 1003, 1004, 1005, 1008, 2000, 1087, 1089, 1104, 1162, 1253, 1257, 1258];

//submit function called when button is pressed
async function submit() {
  input_search = input_text.value; //get input text

  //sets title as the search thing

  document.getElementById('food_name').innerHTML = "Nutrient Values For: " + capitalizeFirstLetter(input_search);

  console.log(input_search);
  input_search = encodeURIComponent(input_search.trim()); //replaces spaces with %20

  api_url = "https://api.nal.usda.gov/fdc/v1/food/" + input_search + "?api_key=DEMO_KEY"

  console.log(api_url);
  await getapi(api_url); //gives nutrient_file all information
  console.log(nutrient_file);

  var necessaryIn = displayData(nutrient_file);
  console.log(necessaryIn);

  //create table

  createTable(necessaryIn);


  //fdc_id = nutrient_file.foods[0].fdcId; //gives fdc_id
  //console.log("fdc id: " + fdc_id);
  //nutrient_name = nutrient_file.foods[0].foodNutrients[0].nutrientName; //gives nutrient name of FIRST nutrient in list
  //console.log("nutrient info: " + nutrient_name);

}
//adds all necessary nutrient information to a singular matrix
function displayData(nutrient_file) {
  var vals = [];
  //if(nutrient_file.foods.foodNutrients )
  let length = nutrient_file.foods[0].foodNutrients.length;
  console.log('meow1');
  for (let i = 0; i < length; i++) {
    var currArr = [];
    if (nutIds.includes(nutrient_file.foods[0].foodNutrients[i].nutrientId)) {
      var unit = nutrient_file.foods[0].foodNutrients[i].unitName;
      currArr[0] = nutrient_file.foods[0].foodNutrients[i].nutrientName;
      currArr[1] = nutrient_file.foods[0].foodNutrients[i].derivationId;
      currArr[2] = nutrient_file.foods[0].foodNutrients[i].value + " " + unit;
      for (let x = 0; x < currArr.length; x++) {
        if (currArr[x] == null) {
          currArr[x] = 'N/A'
        }
      }
      vals[vals.length] = currArr;
    }
    //vals[i] = currArr;
    console.log(i + currArr);
  }
  console.log('meow meow');
  return vals;
}
// Defining async function (reads url)
async function getapi(url) {
  // Storing response
  const response = await fetch(url);

  // Storing data in form of JSON
  nutrient_file = await response.json();
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function createTable(tableData) {
  console.log('in createTable')
  //var table = document.createElement('table');
  var table = document.getElementById('table_id')
  table.setAttribute('width', '100%');
  var tableBody = document.createElement('tbody');
  tableBody.setAttribute('width', '100%');


  tableData.forEach(function(rowData) {
    var row = document.createElement('tr');

    rowData.forEach(function(cellData) {
      var cell = document.createElement('td');
      cell.appendChild(document.createTextNode(cellData));
      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);
  document.body.appendChild(table);
}


//nurientID == 
//1062 == calories (YES)
// 1079 == fiber
// 1093 == sodium
//1003 == protein
// 1004 == total lipid fat
// 1005 == carbohydrate
// 1008 == energy (calories)
// 2000 == sugars including NEA
// 1087 == calcium
// 1089 == iron
// 1104 == Vitamin A, IU
// 1162 == Vitamin C, total ascorbic acid
// 1253 == cholesterol
// 1257 == fatty acids, total trans
// 1258 == fatty acids, total saturated


/*
check to see if the id is relevant || if percentDailyValue exists
  show nutrient name
  show nutrient value
  show percentDailyValue
  for now, we can just start with 2000 (sugars including NEA)
*/

// api id for pexels: CScYg9eYcncfbOvO2hUze7LZLNKsNyi08zQax9rklFlnuWQcVEIf1xBZ
