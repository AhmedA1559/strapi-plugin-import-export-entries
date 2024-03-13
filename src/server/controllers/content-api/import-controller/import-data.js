'use strict';

import Joi from 'joi';

import { InputFormats } from '../../../services/import/parsers';

const { getService } = require('../../../utils');
const { checkParams, handleAsyncError } = require('../utils');

const bodySchema = Joi.object({
  slug: Joi.string().required(),
  data: Joi.any().required(),
  format: Joi.string()
    .valid(...InputFormats)
    .required(),
  idField: Joi.string(),
  alias: Joi.object().pattern(Joi.string(), Joi.string())
});

const importData = async (ctx) => {
  const { user } = ctx.state;

  const { slug, data: dataRaw, format, idField, alias } = checkParams(bodySchema, ctx.request.body);

  const fileContent = await getService('import').parseInputData(format, dataRaw, { slug });

  let res;
  if (fileContent?.version === 2) {
    res = await getService('import').importDataV2(fileContent, {
      slug,
      user,
      idField,
      alias
    });
  } else {
    res = await getService('import').importData(dataRaw, {
      slug,
      format,
      user,
      idField,
      alias
    });
  }

  ctx.body = {
    failures: res.failures,
  };
};

module.exports = ({ strapi }) => handleAsyncError(importData);
