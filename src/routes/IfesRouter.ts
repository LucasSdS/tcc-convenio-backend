import { Router } from "express";
import IfesController from "../modules/api/controller/IfesController";

const router: Router = Router();

router.get("/ifes", IfesController.getAllIfes);
router.get("/ifes/:ifesCode", IfesController.getIfesByCode);

router.post("/ifes/compare/convenios", IfesController.compareIfesConvenios);
export default router;