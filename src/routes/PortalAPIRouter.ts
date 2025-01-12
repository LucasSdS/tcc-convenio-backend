import { Router } from "express";
import PortalAPIController from "../modules/client-api-portal/controller/PortalAPIController";
import { ChangeLogRepository } from "../services/ChangeLogService";

const router: Router = Router();

router.get("/:ifesCode/:year", PortalAPIController.getConvenio);
router.get("/update", PortalAPIController.updateDB);
router.post('/logs', async (req, res) => {
    console.log(req.body);
    await ChangeLogRepository.createLogEntry(req.body);
    res.status(200).json({
        'message': 'ok'
    })
});

export default router;