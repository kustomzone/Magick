// UNDOCUMENTED
import { CompletionHandlerInputData, saveRequest } from '@magickml/core'
import axios from 'axios'
import { BANANA_ENDPOINT } from '../constants'
import { run, start, check } from '@banana-dev/banana-dev'

/**
 * Makes an API request to an AI image completion service.
 *
 * @param {CompletionHandlerInputData} data - The input data for the completion API.
 * @returns {Promise<{success: boolean, result?: string | null, error?: string | null}>} - A Promise resolving to the result of the completion API call.
 */
export async function textToImageCompletion(
  data: CompletionHandlerInputData
): Promise<{
  success: boolean
  result?: Object | null
  error?: string | null
}> {
  // Destructure necessary properties from the data object.
  const { node, inputs, context } = data
  const { projectId, currentSpell } = context

  // Set the current spell for record keeping.
  const spell = currentSpell

  // Get the input text prompt.
  const prompt = inputs['input'][0]

  const requestData = {
    model: node?.data?.model,
    // model_inputs = {
    //   "prompt": "table full of muffins",
    //   "num_inference_steps":50,
    //   "guidance_scale":9,
    //   "height":512,
    //   "width":512,
    //   "seed":3242
    // }
    num_inference_steps: parseFloat(
      (node?.data?.num_inference_steps as string) ?? '30'
    ),
    guidance_scale: parseFloat((node?.data?.guidance_scale as string) ?? '7.5'),
    height: parseFloat((node?.data?.height as string) ?? '512'),
    width: parseFloat((node?.data?.width as string) ?? '512'),
    seed: parseFloat((node?.data?.width as string) ?? '-1'),
  }

  console.log('data is', requestData)

  // Get the settings object, setting default values if necessary.
  // const settings = requestData as any

  // Add the prompt to the settings object.
  // settings.prompt = prompt

  // Make the API request and handle the response.
  try {
    const start = Date.now()
    // const resp = await axios.post(
    //   `${BANANA_ENDPOINT}/`,
    //   {
    //     apiKey: context.module.secrets['docker-diffusers-api-key'],
    //     modelKey: context.module.secrets['docker-diffusers-model-key'],
    //     modelInputs: {
    //       prompt: 'puppy swimming in the ocean',
    //     },
    //   },
    //   {
    //     headers: headers,
    //   }
    // )

    type Outputs = {
      output: {
        id: string
        message: string
        created: number
        apiVersion: string
        modelOutputs: {
          image_base64: string
        }[]
      }
    }

    const outputs = (await run(
      context.module.secrets['banana_api_key'],
      context.module.secrets['banana_ddiffusers_key'],
      {
        prompt,
      }
    )) as Outputs

    // const usage = resp.data.usage

    // Save the request data for future reference.
    // saveRequest({
    //   projectId: projectId,
    //   // requestData: JSON.stringify(settings),
    //   requestData: JSON.stringify('heya'),
    //   responseData: JSON.stringify(resp.data),
    //   startTime: start,
    //   statusCode: resp.status,
    //   status: resp.statusText,
    //   model: 'stable-diffusion-1-5',
    //   // parameters: JSON.stringify(settings),
    //   parameters: JSON.stringify('heya'),
    //   type: 'completion',
    //   provider: 'docker-diffusers',
    //   totalTokens: 0,
    //   hidden: false,
    //   processed: false,
    //   spell,
    //   nodeId: node.id as number,
    // })

    // Check if choices array is not empty, then return the result.
    // if (resp.data.choices && resp.data.choices.length > 0) {
    //   const choice = resp.data.choices[0]
    //   console.log('choice', choice)
    //   return { success: true, result: choice.text }
    // }
    // If no choices were returned, return an error.
    // return { success: false, error: 'No choices returned' }

    return {
      success: true,
      result: outputs.output.modelOutputs[0].image_base64,
    }
  } catch (err: any) {
    console.error(err)
    return { success: false, error: err.message }
  }
}
