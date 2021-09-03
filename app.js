const carList = document.getElementById('car');
const pickUpId = document.getElementById('pickup');
const vendorDropDown = document.getElementById('vendorDropDown');
const sortDropDown = document.getElementById('sortDropDown');
const carDetailsContent = document.querySelector('.car-details-content');
const detailsCloseBtn = document.getElementById('details-close-btn');
const carWrapper = document.getElementById('car-wrapper');

let sortOrder = true;
let myAvails =[];
let myMap ={};
let vendors = [];
// event listeners
carList.addEventListener('click', getCarDetails);
detailsCloseBtn.addEventListener('click', () => {
    carWrapper.className ="car-wrapper"
    carDetailsContent.parentElement.classList.remove('showDetails');
});

window.onload = getCarList;

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function showDropDown(id) {
    document.getElementById(id).classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
        }
    }
}
}


// get car list & create list of all avail card & list of vendors
function getCarList(){
    fetch(`http://www.cartrawler.com/ctabe/cars.json`)
    .then(response => response.json())
    .then(data => {
        const VehAvailRSCore = data[0].VehAvailRSCore;
        const pickupTime = moment(VehAvailRSCore.VehRentalCore[`@PickUpDateTime`]).format("DD.MM.YYYY, hh:mm");
        const returnTime = moment(VehAvailRSCore.VehRentalCore[`@ReturnDateTime`]).format("DD.MM.YYYY, hh:mm");
        const days = moment.duration(moment(VehAvailRSCore.VehRentalCore[`@ReturnDateTime`]).diff(VehAvailRSCore.VehRentalCore[`@PickUpDateTime`])).asDays();
        let html = `<div class="bookingmask-infobar">
                <div class="bookingmask-infobar__row">
                    
                    <div class="bookingmask-infobar__from bookingmask-infobar__cell">
                        <span class="fas fa-arrow-right iconcolor"></span>
                        <div class="bookingmask-infobartext">
                            <div class="bookingmask-infobartext__main">
                                ${VehAvailRSCore.VehRentalCore.PickUpLocation[`@Name`]}(Pickup)
                            </div>
                            <div class="bookingmask-infobartext__sub">
                               ${pickupTime}
                            </div>
                        </div>
                    </div>
                    <div class="bookingmask-infobar__to bookingmask-infobar__cell">
                        <span class="fas fa-arrow-right iconcolor"></span>
                        <div class="bookingmask-infobartext">
                            <div class="bookingmask-infobartext__main">
                            ${VehAvailRSCore.VehRentalCore.ReturnLocation[`@Name`]}(Return)
                            </div>
                            <div class="bookingmask-infobartext__sub">
                                ${returnTime}
                            </div>
                        </div>
                    </div>
                    
                    <div class="bookingmask-infobar__period bookingmask-infobar__cell">
                        <span class="fas fa-calendar-alt iconcolor"></span>
                        <div class="bookingmask-infobartext">
                            <div class="bookingmask-infobartext__main">
                                Rental period
                            </div>
                            <div class="bookingmask-infobartext__sub">
                                ${days} Day(s)
                            </div>
                        </div>
                    </div>

                </div>
            </div>`;
        data[0].VehAvailRSCore.VehVendorAvails.forEach(vendor => {
            vendors.push(vendor.Vendor);
            vendor.VehAvails.forEach( car =>{
                car[`@Code`] = vendor.Vendor[`@Code`];
                car[`@Name`] = vendor.Vendor[`@Name`];
                myAvails.push(car);
            });
            
        });
        pickUpId.innerHTML = html;

        html =`<a id="ALL" onclick="filterVendor('ALL')">ALL</a>`;
        vendors.forEach(v=>{
            html+= `<a id="${v[`@Code`]}" onclick="filterVendor(${v[`@Code`]})">${v[`@Name`]}</a>`;
        });
        vendorDropDown.innerHTML = html;
        avails = myAvails;
        displayCars(myAvails);
    });
}


// filter based on vendor
function filterVendor(code){
    avails = myAvails.filter(v => code == 'ALL' || v[`@Code`] == code);
    displayCars(avails)
}

// filter based on price
function orderPrice(order){
    sortOrder = order;
    displayCars(avails)
}


function displayCars(vehiclesAvailable){
    const sortedResponse = vehiclesAvailable.sort(function(a, b) { res = parseFloat(a.TotalCharge[`@RateTotalAmount`]) - parseFloat(b.TotalCharge[`@RateTotalAmount`]) ; return sortOrder?res :-res});
    let html = "";
    sortedResponse.forEach((car, index) => {
        myMap[index] = car;
        let style =  car.Vehicle[`@AirConditionInd`]? 'A/C' : 'NON/AC' ;
        const name = car.Vehicle.VehMakeModel[`@Name`].replace("or similar","");

        const totalAmount = new Intl.NumberFormat('en-US',
            { style: 'currency', currency: car.TotalCharge[`@CurrencyCode`] }
            ).format(car.TotalCharge[`@RateTotalAmount`]);

        const estTotalAmount = new Intl.NumberFormat('en-US',
            { style: 'currency', currency: car.TotalCharge[`@CurrencyCode`] }
            ).format(car.TotalCharge[`@EstimatedTotalAmount`]);

        html += `
        <div class = "car-item" data-id = "${car.Vehicle.VehMakeModel[`@Name`]}">

            <div class="row">
                <div class="column car-img">
                    <img src = "${car.Vehicle.PictureURL}" alt = "car">
                </div>
                <div class="column car-name"> 
                 <div class="row"><h3  class="alignleft" style="display:inline;">${name}</h3> <span class="fas fa-circle fa-xs available alignright">${car[`@Status`]}</span></div>
                 <div class="row"><h5  class="alignleft" style="display:inline;"> or similar (${car.Vehicle[`@Code`]})</h5>  </div
                    <br><br>
                    <div class="equipment alignleft">
                        <ul>
                            <li title="Air conditioning" class="fas fa-snowflake ">
                            ${style}
                            </li>
                            <li title="Seats" class="fas fa-user">
                            ${car.Vehicle[`@PassengerQuantity`]}
                            </li>
                            <li title="Doors" class="fas fa-door-open">
                            ${car.Vehicle[`@DoorCount`]}
                            </li>
                            <li title="Suitcases" class="fas fa-suitcase">
                            ${car.Vehicle[`@BaggageQuantity`]}
                            </li>
                        
                        </ul>
                    </div>
                    <div class="equipment">
                        <ul>
                            <li title="Fuel" class="fas fa-gas-pump">
                            ${car.Vehicle[`@FuelType`]}
                            </li>        
                            <li  title="Transmission" class="fas fa-cog">
                            ${car.Vehicle[`@TransmissionType`]}
                            </li>              
                        </ul>
                    </div>
                    <br>
                    <div class="equipment"> <a href = "#" id = "${index}"  class = "details-btn">Additional Details</a> </div>
                </div>
                <div class="column car-name"> 
                    <div class="price">
                        <div class="price-section">
                            <h4>Rate Total Amount</h4> <span class="amount"> ${totalAmount}</span>
                        </div>
                        <div class="price-section">
                            <h4>Estimated Total Amount</h4> <span class="amount">${estTotalAmount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <br>
    `;
    });
    carList.innerHTML = html;
}

// get details of the car
function getCarDetails(e){
    e.preventDefault();
    if(e.target.classList.contains('details-btn')){
        carDetailsModal(myMap[e.target.id]);
    }
}

// create a modal
function carDetailsModal(car){
    console.log(car);
    const vehicle = car.Vehicle;
    const amount = car.TotalCharge;
    const name = vehicle.VehMakeModel[`@Name`];
    const totalAmount = new Intl.NumberFormat('en-US',
            { style: 'currency', currency: amount[`@CurrencyCode`] }
            ).format(amount[`@RateTotalAmount`]);

    const estTotalAmount = new Intl.NumberFormat('en-US',
        { style: 'currency', currency: amount[`@CurrencyCode`] }
        ).format(amount[`@EstimatedTotalAmount`]);
    let html = `
        <h2 class = "details-title">${name}</h2>
        <p class = "details-category alignleft">${car[`@Status`]}</p>

        <div class="row"> 
            <div class="column-two"> 

                <div class = "details-instruct">
                    <h3 class="alignleft">Vendor Name:</h3>
                   <span class="alignleft details-instruct-value">${car[`@Name`]}</span>
                </div>

                <div class = "details-instruct">
                    <h3 class="alignleft">Vendor Code:</h3>
                   <span class="alignleft details-instruct-value">${car[`@Code`]}</span>
                </div>

                <div class = "details-instruct">
                    <h3 class="alignleft">AirConditionInd:</h3>
                   <span class="alignleft details-instruct-value">${vehicle[`@AirConditionInd`]}</span>
                </div>

                <div class = "details-instruct">
                    <h3 class="alignleft">BaggageQuantity:</h3>
                   <span class="alignleft details-instruct-value">${vehicle[`@BaggageQuantity`]}</span>
                </div>
                
                <div class = "details-instruct">
                    <h3 class="alignleft">Code:</h3>
                   <span class="alignleft details-instruct-value">${vehicle[`@Code`]}</span>
                </div>

                <div class = "details-instruct">
                    <h3 class="alignleft">CodeContext:</h3>
                   <span class="alignleft details-instruct-value">${vehicle[`@CodeContext`]}</span>
                </div>

                <div class = "details-instruct">
                    <h3 class="alignleft">DoorCount:</h3>
                   <span class="alignleft details-instruct-value">${vehicle[`@DoorCount`]}</span>
                </div>

                <div class = "details-instruct">
                    <h3 class="alignleft">FuelType:</h3>
                   <span class="alignleft details-instruct-value">${vehicle[`@FuelType`]}</span>
                </div>

                <div class = "details-instruct">
                    <h3 class="alignleft">PassengerQuantity:</h3>
                   <span class="alignleft details-instruct-value">${vehicle[`@PassengerQuantity`]}</span>
                </div>

                <div class = "details-instruct">
                    <h3 class="alignleft">TransmissionType:</h3>
                   <span class="alignleft details-instruct-value">${vehicle[`@TransmissionType`]}</span>
                </div>

                <div class = "details-instruct">
                    <h3 class="alignleft">PassengerQuantity:</h3>
                   <span class="alignleft details-instruct-value">${vehicle[`@PassengerQuantity`]}</span>
                </div>      
            </div>

            
            <div class="column-two"> 
                <div class = "details-car-img">
                    <img src = "${vehicle.PictureURL}" alt = "">
                </div>
                <div class = "details-instruct">
                    <h3 class="alignleft">Rate Total Amount:</h3>
                   <span class="alignleft details-instruct-value">${totalAmount}</span>
                </div>

                <div class = "details-instruct">
                    <h3 class="alignleft">Estimated Total Amount:</h3>
                   <span class="alignleft details-instruct-value">${estTotalAmount}</span>
                </div>     
            </div>

        </div>

        

       
    `;
    carWrapper.className ="car-wrapper is-blurred"
    carDetailsContent.innerHTML = html;
    carDetailsContent.parentElement.classList.add('showDetails');
}