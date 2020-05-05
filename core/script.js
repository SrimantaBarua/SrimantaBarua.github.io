function display_projects() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "api/projects/list");
    xhr.responseType = "json";
    xhr.send();
    xhr.onload = function() {
        var json_data = xhr.response;
        console.log(JSON.stringify(json_data));
    }
}


function navbar_click(page_name) {
    var target_id = 'content-' + page_name;
    var content = document.getElementById("content");
    for (var child = content.firstElementChild; child != null; child = child.nextElementSibling) {
        if (child.id == target_id) {
            child.style.display = "block";
        } else {
            child.style.display = "none";
        }
    }
    if (page_name == "projects") {
        display_projects();
    }
}
