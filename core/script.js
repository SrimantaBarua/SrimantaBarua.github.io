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
}
