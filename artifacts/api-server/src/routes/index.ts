import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import restaurantsRouter from "./restaurants";
import ordersRouter from "./orders";
import usersRouter from "./users";
import adminRouter from "./admin";
import driversRouter from "./drivers";
import deliveryRouter from "./delivery";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(restaurantsRouter);
router.use(ordersRouter);
router.use(usersRouter);
router.use(adminRouter);
router.use(driversRouter);
router.use(deliveryRouter);

export default router;
