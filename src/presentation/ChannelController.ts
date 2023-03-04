import { ILoggerService } from "../application/services/LoggerService";
import { IOutputService } from "../application/services/OutputService";
import { AnswerQuestionUseCase } from "../application/usecases/answerQuestion";


export class ChannelController {
    constructor(
        private readonly answerQuestionUseCase: AnswerQuestionUseCase,
        private readonly loggerService: ILoggerService,
        private readonly outputService: IOutputService
    ) {}

    public async handle(text: string): Promise<void> {
        try {
            const codeMessage = await this.checkCodeMessage(text)
            if(!codeMessage) return
    
            await this.selectUseCaseByCode(codeMessage.code, codeMessage.message)
        } catch (error) {
            await this.loggerService.log(error, 'error')
        }
    }

    private async checkCodeMessage(text: string): Promise<{ message: string; code: string; } | void> {
        if(!text.includes(process.env.CODE_DELIMITTER as string)) {
            await this.outputService.sendOutput(`Invalid message format, send a message with the following format: ${process.env.CODE_DELIMITTER}<code> <message>`)
            return void 0
        }

        const [codeWithDelimiter, ...rest] = text.split(' ')
        const message = rest.join(' ')
        const code = codeWithDelimiter.replace(process.env.CODE_DELIMITTER as string, '').replace(':', '')

        return { message, code }
    }

    private async selectUseCaseByCode(code: string, message: string): Promise<void> {
        switch(code) {
            case 'question':
                await this.answerQuestionUseCase.execute(message)
                break
            default:
                await this.outputService.sendOutput('Invalid code')
                break
        }
    }
}