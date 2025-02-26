namespace CAPActionAdFunctionProject;

entity Project {
    key ID          : Integer                        @title: '{i18n>ID}';
        projectName : String(50)                     @title: '{i18n>projName}';
        descr       : String(200)                    @title: '{i18n>descr}';
        status      : Association to SCProjectStatus @title: '{i18n>status}';
}

entity SCProjectStatus {
    key code : String(4);
        name : String(10);
}

entity SCStatusTransitionMatrix {
    key fromStatus : Association to SCProjectStatus;
    key toStatus   : Association to SCProjectStatus;
}
