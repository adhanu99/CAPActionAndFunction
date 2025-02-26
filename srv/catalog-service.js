const cds = require("@sap/cds");
const log = require('cf-nodejs-logging-support');
const TextBundle = require("@sap/textbundle").TextBundle;
const langparser = require("accept-language-parser");

/** this function fetches the user language from the req header: Accept-Language */
function getLocale(req) {
    let lang = req.headers["accept-language"];
    if (!lang) {
        return null;
    }
    let arr = langparser.parse(lang);
    if (!arr || arr.length < 1) {
        return null;
    }
    let locale = arr[0].code;
    if (arr[0].region) {
        locale += "_" + arr[0].region;
    }
    return locale;
}

module.exports = cds.service.impl(async (service) => {

    const { Project, SCProjectStatus, SCStatusTransitionMatrix } = service.entities;

    service.before("*", async (req) => {
        try {
            i18n = new TextBundle('../srv/i18n/i18n', getLocale(req));
        } catch (error) {
            log.error(`Failed to create TextBundle: ${error}`);
        }
    });

    /** Event Handler */
    service.before("CREATE", Project, async (req) => {
        req.data.status_code = "PEND";
    });

    /** Function to validate Project Status */
    const fnValidateProjectStatus = async (sFromStatus, sToStatus) => {
        const oStatusTransitionMatrix = await SELECT.from(SCStatusTransitionMatrix).where({ fromStatus_code: sFromStatus, toStatus_code: sToStatus });
        return oStatusTransitionMatrix.length > 0;
    }

    /** Action to Approve Project */
    service.on('approveProject', async (req) => {
        const { ID } = req.data;
        const oFromStatus = await SELECT.one.from(Project).columns('status_code').where({ ID: ID });
        const bProjectStatusUpdated = await fnValidateProjectStatus(oFromStatus.status_code, "APPR");
        if (bProjectStatusUpdated) {
            await UPDATE(Project).set({ status_code: "APPR" }).where({ ID: ID });
            return "Success";
        }
        else {
            return req.error(412, i18n.getText("ProjectCouldNotBeApproved"));
        }
    });

    /** Action to Reject Project */
    service.on('rejectProject', async (req) => {
        const { ID } = req.data;
        const oFromStatus = await SELECT.one.from(Project).columns('status_code').where({ ID: ID });
        const bProjectStatusUpdated = await fnValidateProjectStatus(oFromStatus.status_code, "RJCT");
        if (bProjectStatusUpdated) {
            await UPDATE(Project).set({ status_code: "RJCT" }).where({ ID: ID });
            return "Success";
        }
        else {
            return req.error(412, i18n.getText("ProjectCouldNotBeReject"));
        }
    });

    /** Action to Delete Project */
    service.on('deleteProject', async (req) => {
        const { ID } = req.data;
        const oFromStatus = await SELECT.one.from(Project).columns('status_code').where({ ID: ID });
        const bProjectStatusUpdated = await fnValidateProjectStatus(oFromStatus.status_code, "DELT");
        if (bProjectStatusUpdated) {
            await UPDATE(Project).set({ status_code: "DELT" }).where({ ID: ID });
            return "Success";
        }
        else {
            return req.error(412, i18n.getText("ProjectCouldNotBeDelete"));
        }
    });

});