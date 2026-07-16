import Mail from "../../lib/Mail.js";
import { emailTemplate } from "../../lib/emailTemplate.js";

interface JobData {
  contratoId: number;
  usuarioNome: string;
  usuarioEmail: string;
  dataFim: Date;
  cancelLink: string;
  archiveLink: string;
  keepLink: string;
}

export default {
  key: "ExpirationNotificationJob",

  async handle({ data }: { data: JobData }) {
    const {
      contratoId,
      usuarioNome,
      usuarioEmail,
      dataFim,
      cancelLink,
      archiveLink,
      keepLink,
    } = data;

    const dataFormatada = new Date(dataFim).toLocaleDateString("pt-BR");

    const html = emailTemplate({
      title: `Contrato #${contratoId} expirado`,
      subtitle: `Olá, ${usuarioNome}.`,

      content: `
        <p style="margin:0 0 16px;">
          Identificamos que o contrato
          <strong>#${contratoId}</strong>
          expirou em
          <strong>${dataFormatada}</strong>.
        </p>

        <p style="margin:0 0 20px;">
          Escolha uma das opções abaixo para definir como deseja prosseguir:
        </p>

        <p style="
          margin:24px 0 0;
          font-size:14px;
          color:#64748B;
        ">
          Caso nenhuma ação seja realizada, o contrato continuará marcado como atrasado.
        </p>
      `,
      buttons: [
        {
          text: "Cancelar contrato",
          url: cancelLink,
          color: "pink",
        },
        {
          text: "Arquivar contrato",
          url: archiveLink,
          color: "blue",
        },
        {
          text: "Manter como atrasado",
          url: keepLink,
          color: "gray",
        },
      ],

      footer:
        "Esta é uma mensagem automática. Caso tenha dúvidas, entre em contato com nossa equipe.",
    });

    await Mail.send({
      to: usuarioEmail,
      subject: `Contrato #${contratoId} expirado`,
      html,
    });
  },
};
