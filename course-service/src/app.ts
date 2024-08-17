import app from "./express";

import { logger } from "@envy-core/common";

const port = 3003

app.listen(port, () => {
    logger.info(`Couser Service is running on http://localhost:${port}`);
  });
  
