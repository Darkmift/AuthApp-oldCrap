//maindisplay
mainDisplay = $('#mainDisplay');
//menu button control
BtnForm = $('#operationBtn');
//user/student/course list display
listContainer = $('#listContainer');
if (listContainer.html().trim().length === 0) {
    //on initial load of page
    mainDisplay.css('display', 'none');
} else {
    mainDisplay.css('display', 'visible');
}
//display info of clicked in listcontainer
detailsDisplay = $('#detailsDisplay');
//buttons in display
mngBtn = $('#mngBtn');
//init global for use in scope
var btnName;
//csrf
var csrfName = $('[name="csrf_name"]');
var csrfValue = $('[name="csrf_value"]');

BtnForm.children().children().click(
    function(e) {
        e.preventDefault();
        mngBtn.css('visibility', 'none');
        console.log('form clicked');
        console.log($(this).text());
        //sset name of btn
        btnName = $(this).text();
        // append and submit
        submitInput = $('<input>').attr({
            type: "hidden",
            name: btnName,
            value: btnName
        });
        console.log(submitInput.attr('name'));
        BtnForm.append(
            submitInput
        ).submit();
    }
);
var table;
//ajax functions for right div display.
listContainer.children().click(
    function(e) {
        //get id of clicked
        idClicked = $(this).attr('id');
        //get table name
        type = $(this).attr('elType') + 's';
        //student/course/user info header
        display.children[0].innerHTML = "<h4>" + $(this).attr('elType') + " info:</h4><hr>";
        mngBtn.css('visibility', 'visible');
        $.get(type + "/" + idClicked).done(function(data) {
            table = type;
            //console.log(data);
            //showEntry(data, type);
        }).done(
            function(data) {
                showEntry(data, table);
                setBtns(data, table);
            }
        ).done(
            $('#UpDelBtns').click(
                function(e) {
                    var BtnClicked = event.target;
                    // console.log('BtnClicked id: ' + BtnClicked.id,'BtnClicked type: ' + BtnClicked.name,'BtnClicked do: ', BtnClicked.value);
                    //console.log(data);
                    dataParsed = data;
                    if (BtnClicked.value == "del") {
                        editEntry(BtnClicked.name, BtnClicked.id, BtnClicked.value);
                        $('#' + BtnClicked.id).remove();
                        $('#detailsDisplay').html($('<div>', {
                            class: "alert alert-success",
                            text: "Entry Deletion succesful!"
                        }));
                        $('#UpDelBtns').empty();
                    }
                    if (BtnClicked.value == "update") {
                        console.log("update: ", dataParsed.id, 'do:' + BtnClicked.value, 'table: ' + BtnClicked.name);
                        var url;
                        switch (BtnClicked.name) {
                            case "users":
                            case "students":
                                url = "user_update";
                                break;
                            case "courses":
                                url = "course_update";
                                break;
                        }
                        csrfName = $('[name="csrf_name"]');
                        csrfValue = $('[name="csrf_value"]');
                        var form = $('<form action="' + url + '" method="post">' +
                            '<input type="text" name="id" value="' + String(dataParsed.id) + '" />' +
                            '<input type="text" name="type" value="' + BtnClicked.name + '" />' +
                            '<input type="text" name="csrf_name" value="' + csrfName.val() + '" />' +
                            '<input type="text" name="csrf_value" value="' + csrfValue.val() + '" />' +
                            '</form>');
                        //console.log(form);
                        $('body').append(form);
                        form.submit();
                        //graveyard chunk 01 here
                    }
                    if (BtnClicked.value == "enroll") {
                        $('#enrollmentList').html(
                            JSON.stringify(
                                editEntry(BtnClicked.name, BtnClicked.id, BtnClicked.value)
                            )
                        );
                    }
                }
            )
        );
    }
);
//build info panel of clicked on left panel
function showEntry(data, type) {
    container = detailsDisplay;
    data = JSON.parse(data);
    //console.log('full: ', data);
    enrolls = data['enrollments'];
    data = data['selectedEntity'][0];
    studentsInCourse = [];
    coursesForStudent = [];
    //console.log(coursesForStudent.length);
    enrolls.forEach(enroll => {
        studentsInCourse.push(enroll[1]);
        coursesForStudent.push(enroll[2]);
    });
    //console.log(coursesForStudent.length);
    if (coursesForStudent.length == 0) {
        coursesForStudent = 'no students enlisted';
    } else {
        //coursesForStudent = JSON.stringify(coursesForStudent);
        coursesForStudent = enrollmentListTable(coursesForStudent, 'Students in this Course: ');
    }

    if (studentsInCourse.length == 0) {
        studentsInCourse = 'not enlisted to any courses';
    } else {
        //studentsInCourse = JSON.stringify(studentsInCourse);
        studentsInCourse = enrollmentListTable(studentsInCourse, data.name + ' is enlisted in: ');
    }
    container.html($('<p>').append(
        $('<img>', {
            src: "images/" + type + "/" + data.id + ".jpg",
            alt: type + '#' + data.id + 'image',
        }).addClass('img-responsive img-circle').css('border', '2px solid #e8e8e8').css({
            width: '8vw',
        })
    ));
    switch (type) {
        case 'students':
            $('<ul>').append(
                $('<li>').text(type + ' name:' + data.name),
                $('<li>').text('Email : ' + data.email),
                $('<li>').text('Phone : ' + data.phone),
                $('<li>').attr('id', 'enrollmentsTabe').html(studentsInCourse),
            ).appendTo(container);
            break;
        case 'users':
            $('<ul>').append(
                $('<li>').text(type + ' name:' + data.name),
                $('<li>').text('Email : ' + data.email),
                $('<li>').text('Phone : ' + data.phone),
            ).appendTo(container);
            break;
        case 'courses':
            $('<ul>').append(
                $('<li>').html('<b>Course Name</b>:<br>' + data.name),
                $('<li>').html('<b>Course duration</b>:<br>' + data.start_date + " until: " + data.end_date),
                $('<li>').append(
                    $('<b>').html('<b>Description</b> :<br>'),
                    $('<div>').css({
                        height: "100px",
                        backgroundColor: "#e8e8e8",
                        border: "1px solid #ddd",
                        padding: "2px",
                        overflow: "scroll"
                    }).html(data.description)
                ),
                $('<li>').attr('id', 'enrollmentsTabe').html(coursesForStudent),
            ).appendTo(container);
            break;
    }
    return container;
}
//set functions of update/delete buttons
function setBtns(info, type) {
    container = $('#UpDelBtns');
    data = JSON.parse(info);
    //console.log(data);
    logged = data['logged'];
    data = data['selectedEntity'][0];

    switch (table) {
        case "users":
            container.html([
                makeBtn(data.id, type, "update", "btn btn-warning", "Update"),
                makeBtn(data.id, type, "del", "btn btn-danger", "Delete"),
            ]);
            //hide buttons if user viewing themselves
            if ((!data.id === logged) && table === "users") {
                //console.log('not allowed');
                $('[name="users"]').css("display", "visible");
            } else {
                $('[name="users"]').css("display", "none");
            }
            break;
        case "students":
        case "courses":
            //console.log('logged: ', logged, 'data.id: ', data.id);
            container.html([
                makeBtn(data.id, type, "enroll", "btn btn-default", "Enroll"),
                makeBtn(data.id, type, "update", "btn btn-warning", "Update"),
                makeBtn(data.id, type, "del", "btn btn-danger", "Delete"),
            ]);
            break;
    }
}

//global alert remover
setInterval(function() {
    if ('.alert') {
        setTimeout(() => {
            $('.alert').slideUp();
            setTimeout(() => {
                $('.alert').remove();
            }, 1000);
        }, 4000);
    }
}, 500);

function makeBtn(btnId, btnType, btnValue, btnClassName, btnText) {
    //console.log(btnValue);
    var btn = $('<button>', {
        id: btnId,
        name: btnType,
        value: btnValue,
        class: btnClassName,
        text: btnText,
    });
    if (btnValue === 'enroll') {
        btn.attr('data-toggle', 'modal');
        btn.attr('data-target', '#myModal');
    }
    return btn;
}

//send delete request
function editEntry(type, id, action) {
    //console.log(type, id, action);
    if (action === "del") {
        urlStr = "updateEntry";
        methodType = "GET";
        info = JSON.stringify({
            type: type,
            id: id,
            action: action,
            "csrf_name": csrfName.val(),
            "csrf_value": csrfValue.val()
        });
    }
    if (action === "enroll") {
        urlStr = "getEnrollments";
        methodType = "GET";
        info = {
            type: type,
            id: id,
            action: action,
        };
        enrollmentArray = [];
    }

    $.ajax({
        type: methodType,
        url: urlStr,
        data: info,
        error: function(e) {
            console.log(e, status);
        },
        success: function(data, status) {
            console.log('data: ', data, 'status: ', status);
            //console.log('enrollments:', data.length);
            data.forEach(entry => {
                obj = {
                    "course": entry[1],
                    "student": entry[0]
                }
                enrollmentArray.push(obj);
            });
        },
        dataType: "json",
        contentType: "application/json"
    });
    //console.log('enrollmentArray: ', enrollmentArray);
    return enrollmentArray ? enrollmentArray : '';
}
//graveeyard chunk 2

function enrollmentListTable(enrollmentList, tableName) {
    //var enrollments = JSON.parse(enrollmentList);
    var enrollments = enrollmentList;
    var trCount = 1;
    table = $('<table>', {
        class: 'table table-bordered table-hover table-striped',
    }).css('margin-top', '5px');
    thead = $('<thead>').append(
        $('<tr>', {
            class: 'active',
        }).append(
            $('<th>').text(tableName)
        )
    );
    table.append(thead);
    tbody = $('<tbody>');
    enrollments.forEach(enroll => {
        td = $('<td>').text(enroll);
        tr = $('<tr>').append(td);
        tbody.append(tr);
    });
    table.append(tbody);
    //console.log(table[0].innerHTML, enrollments, tableName);
    return table;
}