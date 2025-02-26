using {CAPActionAdFunctionProject as db} from '../db/datamodel';

service CAPActionAndFunction {

    entity Project                  as projection on db.Project;
    entity SCProjectStatus          as projection on db.SCProjectStatus;
    entity SCStatusTransitionMatrix as projection on db.SCStatusTransitionMatrix;

    /** Actions */
    action approveProject(ID : Integer) returns String;
    action rejectProject(ID : Integer) returns String;
    action deleteProject(ID : Integer) returns String;
}
