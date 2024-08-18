import app from "./express";

import { logger } from "@envy-core/common";
import connectDB from "./config/database";

const port = 3003

connectDB()

app.listen(port, () => {
    logger.info(`Course Service is running on http://localhost:${port}`);
  });
  
