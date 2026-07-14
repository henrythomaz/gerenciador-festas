/**
 * @file User.ts
 * @description Modelo de usuário da aplicação.
 * Define a estrutura, validações e métodos do modelo User no banco de dados.
 * Utiliza Sequelize ORM para gerenciar a persistência.
 */

import {
  Sequelize,
  DataTypes,
  Model,
} from "sequelize";
import bcrypt from "bcryptjs";

/**
 * Interface que define os atributos do modelo User.
 * @interface AtributosUsuario
 * @description Descreve todos os campos que um usuário pode ter.
 */
interface AtributosUsuario {
  /** ID único do usuário (auto-incrementado) */
  id?: number;
  /** Nome completo do usuário */
  nome: string;
  /** Email do usuário (único) */
  email: string;
  /** Senha em texto plano (apenas para criação/atualização) */
  senha?: string;
  /** Hash da senha armazenado no banco */
  senha_hash: string;
  /** Indica se o email foi confirmado */
  email_confirmado?: boolean;
  /** Token para confirmação de email */
  email_confirmacao_token?: string | null;
  /** Data do último login do usuário */
  ultimo_login?: Date | null;
  /** Data de criação do registro */
  criado_em?: Date;
  /** Data da última atualização do registro */
  atualizado_em?: Date;
}

/**
 * Classe modelo de Usuário.
 * @class User
 * @extends Model<AtributosUsuario>
 * @implements AtributosUsuario
 * @description Representa um usuário no sistema com todos os seus atributos e métodos.
 */
class User extends Model<AtributosUsuario> implements AtributosUsuario {
  declare id?: number;
  declare nome: string;
  declare email: string;
  declare senha?: string;
  declare senha_hash: string;
  declare email_confirmado?: boolean;
  declare email_confirmacao_token?: string | null;
  declare ultimo_login?: Date | null;
  declare readonly criado_em: Date;
  declare readonly atualizado_em: Date;

  /**
   * Inicializa o modelo User no Sequelize.
   * @static
   * @method initModel
   * @param {Sequelize} sequelize - Instância do Sequelize conectada ao banco
   * @returns {Model} Modelo User inicializado
   * @description Define os campos, configurações e hooks do modelo.
   */
  static initModel(sequelize: Sequelize) {
    const model = super.init(
      {
        /** Nome do usuário */
        nome: DataTypes.STRING,
        /** Email do usuário */
        email: DataTypes.STRING,
        /** Senha em texto plano (não é armazenada no banco) */
        senha: DataTypes.VIRTUAL,
        /** Hash da senha (armazenado no banco) */
        senha_hash: DataTypes.STRING,
        /** Status de confirmação do email */
        email_confirmado: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        /** Token para confirmação do email */
        email_confirmacao_token: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        /** Data do último login */
        ultimo_login: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
        },
      },
      {
        sequelize,
        tableName: "users",
        modelName: "User",
        underscored: true,
        createdAt: "criado_em",
        updatedAt: "atualizado_em",
      }
    );

    /**
     * Hook executado antes de salvar o usuário.
     * @hook beforeSave
     * @description Criptografa a senha antes de persistir no banco de dados.
     * @param {User} usuario - Instância do usuário sendo salvo
     */
    this.addHook("beforeSave", async (usuario: User) => {
      if (usuario.senha) {
        usuario.senha_hash = await bcrypt.hash(usuario.senha, 8);
      }
    });

    return model;
  }

  // /**
  //  * Define os relacionamentos do modelo User.
  //  * @static
  //  * @method associate
  //  * @param {any} models - Todos os modelos da aplicação
  //  * @description Relaciona User com outros modelos (ex: Estacao).
  //  */
  // static associate(models: any) {
  //   this.belongsToMany(models.Estacao, {
  //     through: "usuarios_estacoes",
  //     foreignKey: "usuario_id",
  //     as: "estacoes",
  //   });
  // }

  /**
   * Verifica se a senha fornecida corresponde ao hash armazenado.
   * @method checkPassword
   * @async
   * @param {string} senha - Senha em texto plano para verificação
   * @returns {Promise<boolean>} True se a senha estiver correta, false caso contrário
   * @description Compara a senha fornecida com o hash armazenado no banco.
   * 
   * @example
   * // Verificar senha do usuário
   * const usuario = await User.findByPk(1);
   * const senhaCorreta = await usuario.checkPassword("123456");
   * if (senhaCorreta) {
   *   console.log("Senha válida");
   * }
   */
  async checkPassword(senha: string) {
    return bcrypt.compare(senha, this.senha_hash);
  }
}

/**
 * Exporta o modelo User.
 * @default
 */
export default User;
