

//Show the dates/times
function getSchedule(event){
    history.pushState({step: "date"}, "", `date`);

    window.onpopstate = function(event) {
        //when back button is pressed show duration and clear the schedule
        let section = document.getElementById("duration-view");
        section.style.display = "block";

        let schedsection = document.getElementById("schedule-view");
        schedsection.style.display = "none";
       
       
        const collection = document.getElementById("sched-col").querySelectorAll("div.col");
      
        for (let i = 0; i < collection.length; i++) {
            collection[i].remove();
        }
        
    }

     //Clear the view
   /*  const myNode = document.getElementById("duration-view");
     while (myNode.firstChild) {
       myNode.removeChild(myNode.lastChild);
     };*/

    let div = document.getElementById("duration-view");
    div.style.display = "none";

    let block = document.getElementById("schedule-view");
    if(document.body.contains(document.getElementById('date-title'))== false){
    block.insertAdjacentHTML("afterbegin", `<h3 id="date-title">Select a time/date.</h3>`);}
    block.style.display = "block";

    event.preventDefault();
    const duration = event.target.duration.value;
    const submitduration = event.target.submitduration.value;

     let post_data = JSON.stringify({duration, submitduration});
        console.log("Post:" + post_data); 
        fetch('/schedule', {
            method: 'POST', 
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
            body: post_data
        }) 

        .then(response => response.json())
        .then(schedule => {
            console.log(schedule);
            //get unique dates from the response
            let uniqueDates = [];
            for (let j=0; j<schedule.length; j++){
                
                let date = new Date(schedule[j].fields.start);
                options = {
                    year: 'numeric', month: 'numeric', day: 'numeric',
                    hour: 'numeric', minute: 'numeric', second: 'numeric',
                    hour12: true,
                    timeZone: 'Factory'
                  };
                  
                  let newdate = new Intl.DateTimeFormat('en-US', options).format(date);
                  uniqueDates.push(newdate);  
            }
            uniqueDates = [...new Set(uniqueDates)]
              console.log(uniqueDates)  


                for (let i = 0; i < uniqueDates.length; i++){
                    const item = `<form id="getWorkersForm" onsubmit="getWorkers(event)" action="{% url 'worker' %}" method="POST">\
                    <input type="hidden" name="start" value="${uniqueDates[i]}">\
                    <input type="hidden" name="duration" value="${schedule[0].fields.duration}">\
                    <input type="submit" value="${uniqueDates[i]}" class="p-3 border bg-light text-center"\
                        id="schedule"> </form>`
               

                const div = document.createElement('div');
                div.setAttribute("class", "col");
                div.innerHTML = item;
                document.querySelector('#sched-col').append(div);

};
        });
    };






//show the worker names
function getWorkers(event) {
    history.pushState({step: "worker"}, "", `worker`);
    
    window.onpopstate = function(event) {
        //when back button is pressed show dates and clear worker names 
        let section = document.getElementById("schedule-view");
        section.style.display = "block";

        let schedsection = document.getElementById("workers-view");
        schedsection.style.display = "none";

        const collection = document.getElementById("worker-col").querySelectorAll("div.col");
      
        for (let i = 0; i < collection.length; i++) {
            collection[i].remove();
        
    }
        //clear the footer

        document.querySelector("h6").remove();

        
    }

    event.preventDefault();
    const start = event.target.start.value;
    const duration = event.target.duration.value;

    let post_data = JSON.stringify({start, duration});
        console.log(post_data); 
        fetch('/worker', {
            method: 'POST', 
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
            body: post_data
            
        }) 


        .then(response => response.json())
        .then(workerDetails => {

            console.log(workerDetails);
            const h6 = document.createElement("h6");
                const startTime = document.createTextNode(`${start} for ${duration} hours`);
                h6.appendChild(startTime);
                document.querySelector('footer').append(h6);
            

            if (workerDetails.length > 0){

      
                let section = document.getElementById("schedule-view");
                section.style.display = "none";   

                let block = document.getElementById("workers-view");
                
                if(document.body.contains(document.getElementById('worker-title')) == false){
                block.insertAdjacentHTML("afterbegin", `<h3 id="worker-title">Pick a worker.</h3>`);}
                block.style.display = "block"; 

                for (let i = 0; i < workerDetails.length; i++){

                   
                    const item = ` <form id="getWorkersForm" onsubmit="finishBooking(event)" action="{% url 'checkout' %}" method="POST">\
                     <input type="hidden" name="start" value="${start}">\
                     <input type="hidden" name="duration" value="${duration}">\
                     <input type="hidden" name="id" value="${workerDetails[i].id}">\
                     <button type="submit" name="worker" class="workername p-3 border bg-light text-center" value="${workerDetails[i].first_name}  ${workerDetails[i].last_name}"> \
                     ${workerDetails[i].first_name}  ${workerDetails[i].last_name}<br> Rating: ${Number(workerDetails[i].rating).toFixed(2)} </button></form>`
                     

                    
                    const div = document.createElement('div');
                    div.setAttribute("class", "col");
                    div.innerHTML = item;
                    document.querySelector('#worker-col').append(div);
                
                }
            }
        });
};

//Last step of booking 
function finishBooking(event) {
    history.pushState({step: "checkout"}, "", `checkout`);
   
    window.onpopstate = function(event) {
        //when back button is pressed show dates and clear worker names 
        let section = document.getElementById("workers-view");
        section.style.display = "block";

        let schedsection = document.getElementById("finalize");
        schedsection.style.display = "none";

        const collection = document.getElementById("checkout").querySelectorAll("ul.list-group");
      
        for (let i = 0; i < collection.length; i++) {
            collection[i].remove();
    
    }

    document.getElementById("book-btn").remove();
       
    //clear the second line in the footer

        document.querySelectorAll("h6")[1].remove();


        getWorkers(event);    
    }
   
   
   
   
   
   
    event.preventDefault();
    const id = event.target.id.value;
    const start = event.target.start.value;
    const worker = event.target.worker.value;
   
    
   
    let post_data = JSON.stringify({id, start, worker});
    console.log(post_data); 
    fetch('/checkout', {
        method: 'POST', 
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: post_data
        
    }) 

    .then(response => response.json())
    .then(checkout => {
    
        const h6 = document.createElement("h6");
        const worker = document.createTextNode(`with ${checkout[0].fields.first_name} ${checkout[0].fields.last_name}`);
        h6.appendChild(worker);
        document.querySelector('footer').append(h6);

        document.querySelector(`#finalize`).style.display = 'block';

    if (checkout.length > 0){


        let section = document.getElementById("workers-view");
        section.style.display = "none";   

        let block = document.getElementById("finalize");
        if(document.body.contains(document.getElementById('checkout-title')) == false){
        block.insertAdjacentHTML("afterbegin", `<h3 id="checkout-title">Complete your booking.</h3>`);}

        console.log(checkout);

        //Add the booking details
        const ul = document.createElement('ul');
        ul.setAttribute("class", "list-group list-group-flush");

        let date = new Date(checkout[1].fields.start);
        options = {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: true,
            timeZone: 'Factory'
          };
          
          newdate = new Intl.DateTimeFormat('en-US', options).format(date);

        let price = 0;  
        if(checkout[1].fields.duration == 2)
            { price = 100;} 
            else {price = 200;};


        const details = `<li class="list-group-item">Service: Cleaning</li> <li class="list-group-item">Duration: ${checkout[1].fields.duration} hours </li> \
                        <li class="list-group-item">Date: ${newdate} </li> \
                        <li class="list-group-item">Service Provider: ${checkout[0].fields.first_name} ${checkout[0].fields.last_name}</li> \
                        <li class="list-group-item">Price: ${price} AED - Cash only`;

        ul.innerHTML = details;
        document.querySelector("#checkout").appendChild(ul);

     


        const item = `<form id="checkout" onsubmit="checkout(event)" action="{% url 'finalize' %}" method="POST">\
                     <input type="hidden" name="id" value="${checkout[1]['pk']}">\
                     <input type="submit"  class="btn btn-primary" value="Book" name="book" id="book-btn"></form> `;

        const div = document.createElement('div');
       
        div.innerHTML = item;
        document.querySelector('#finalize').appendChild(div);

    

        //Show message for logged out users
        const p = document.createElement('p');
        const login = `<a href="{% url 'login' %}">Please log in to complete your booking.</a>`;
        p.innerHTML = login;
        document.querySelector("#loginrequired").append(p); 
    }
    });
};


function checkout(event) {
    event.preventDefault();
    const id = event.target.id.value;
    //const user = JSON.parse(document.getElementById('user_id').textContent);
    const user = document.getElementById('user_id').textContent;
    
   
    let post_data = JSON.stringify({id, user});
    console.log(post_data); 
    fetch('/finalize', {
        method: 'POST', 
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: post_data
        
    }) 

   // .then(response => response.json())
    .then(finalize => {
       

        const p = document.createElement('p');
        const success = `Booking successfully created. See you soon!`;
        p.innerHTML = success;
        document.querySelector("#finalize").append(p); 
        


    });
};

//Code used from https://www.w3schools.com/howto/howto_js_tabs.asp

function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
  }

  
function rate(id){
      //Replace the button with a dropdown for rating
      let form = document.createElement('form');
      form.id =   `rate${id}`;
      form.action = `{% url 'rate' %}`;
      form.method = "POST";

      formitems  = `<input type="hidden"  name ="id" value="${id}">
      <select id="select${id}" name = "rating" class="form-select form-select-sm" aria-label=".form-select-sm example">
        <option selected>Select Rating</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        </select><input type="submit" class="btn btn-link" value="Save"/></form>`

    form.innerHTML = formitems;
    const button = document.querySelector(`#r${id}`);
    button.parentNode.replaceChild(form, button);

    document.querySelector(`#rate${id}`).onsubmit = function(event) {
        console.log("entered rating fuction")
        event.preventDefault();
        let rating = document.querySelector(`#select${id}`).value;
        console.log(JSON.stringify({id, rating}));
 
        fetch('rate', {
            method: 'POST', 
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
            body: JSON.stringify({id, rating})
    
          })
        
          .then(response => response.json())
          .then(result => {
            
       
        let rateform = document.querySelector('form') ;
        let div = document.createElement('div');
        div.innerHTML = `<class="col">${rating}`;
        console.log(div);
        rateform.parentNode.replaceChild(div, rateform);
        console.log(rateform.parent);
        });
        
       
};
};
