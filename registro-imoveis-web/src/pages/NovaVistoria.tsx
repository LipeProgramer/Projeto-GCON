import { useEffect, useState } from 'react';
import { salvarVistoriaNoFirebase } from '../services/vistoriaService';
import type { Vistoria } from '../types/vistoria';
import '../styles/NovaVistoria.css';

const LOCAL_DRAFTS_KEY = 'registro-gcon-drafts';

interface SavedProjeto extends Vistoria {
  modifiedAt: string;
}

const orgaosValidos: Record<string, string> = {
  '01': 'PMM - Prefeitura Municipal de Maringá',
  '03': 'MGAPREV - Maringá Previdência',
  '16': 'IAM - Instituto Ambiental de Maringá',
};

const secretariasValidas: Record<string, string> = {
  '02': 'GAPRE',
  '03': 'PROGE',
  '04': 'SEGOV',
  '05': 'SELOG',
  '06': 'SEFAZ',
  '07': 'SEURBH',
  '08': 'SAUDE',
  '09': 'SEDUC',
  '10': 'SEBEA',
  '11': 'SEMOB',
  '12': 'SAET',
  '13': 'SAS',
  '14': 'SEMUC',
  '15': 'SESP',
  '16': 'SEMULHER',
  '17': 'COMPLIANCE',
  '19': 'SEINFRA',
  '20': 'SEMOP',
  '22': 'SEGEP',
  '26': 'SSM',
  '27': 'SELURB',
  '28': 'AMETRO',
  '29': 'SETRAB',
  '31': 'SEJUC',
  '33': 'SECOM',
  '34': 'SECRIANCA',
  '35': 'AMETECH',
  '36': 'SEPED',
  '99': 'Comissões e Conselhos',
};

const listaSecretariasDropdown = Object.values(secretariasValidas);

const initialVistoriaState: Partial<Vistoria> = {
  nomeProjeto: '',
  processoSei: '',
  endereco: '',
  secretaria: listaSecretariasDropdown[3],
  dataVistoria: '',
  observacoes: '',
  ambientes: [],
};

function formatarData(iso: string) {
  if (!iso) return '';
  const data = new Date(iso);
  return data.toLocaleDateString('pt-BR');
}

function carregarDraftsDoStorage(): SavedProjeto[] {
  if (typeof window === 'undefined') return [];
  const dados = window.localStorage.getItem(LOCAL_DRAFTS_KEY);
  if (!dados) return [];
  try {
    return JSON.parse(dados) as SavedProjeto[];
  } catch {
    return [];
  }
}

function agruparPorData(itens: SavedProjeto[]): Record<string, SavedProjeto[]> {
  return itens.reduce<Record<string, SavedProjeto[]>>((groups, item) => {
    const data = formatarData(item.modifiedAt);
    groups[data] = groups[data] ?? [];
    groups[data].push(item);
    return groups;
  }, {});
}

export function NovaVistoria() {
  const [vistoria, setVistoria] = useState<Partial<Vistoria>>({
    ...initialVistoriaState,
    id: crypto.randomUUID?.() ?? `${Date.now()}`,
  });
  const [salvos, setSalvos] = useState<SavedProjeto[]>([]);
  const [statusMensagem, setStatusMensagem] = useState('');
  const [aGuardar, setAGuardar] = useState(false);
  const [msgProcesso, setMsgProcesso] = useState({ text: '', color: '' });
  const [mostrarListaProjetos, setMostrarListaProjetos] = useState(false);

  useEffect(() => {
    setSalvos(carregarDraftsDoStorage().sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt)));
  }, []);

  const validarFormulario = () => {
    const errosAtuais: string[] = [];

    if (!vistoria.nomeProjeto?.trim()) {
      errosAtuais.push('Nome do projeto é obrigatório.');
    }
    if (!vistoria.processoSei?.trim()) {
      errosAtuais.push('Processo SEI é obrigatório.');
    }
    if (!vistoria.endereco?.trim()) {
      errosAtuais.push('Endereço do imóvel é obrigatório.');
    }
    if (!vistoria.ambientes?.length) {
      errosAtuais.push('Adicione pelo menos um ambiente.');
    }
    if (vistoria.processoSei && vistoria.processoSei.length < 22) {
      errosAtuais.push('Processo SEI incompleto.');
    }

    if (errosAtuais.length > 0) {
      setStatusMensagem(errosAtuais.join('; '));
      return false;
    }
    setStatusMensagem('');
    return true;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    try {
      setAGuardar(true);
      setStatusMensagem('⏳ Salvando projeto no servidor...');

      await salvarVistoriaNoFirebase(vistoria);

      const draft: SavedProjeto = {
        ...(vistoria as SavedProjeto),
        id: ((vistoria as any).id || crypto.randomUUID?.()) ?? `${Date.now()}`,
        modifiedAt: new Date().toISOString(),
      };

      const draftsAtuais = carregarDraftsDoStorage();
      const indexExistente = draftsAtuais.findIndex((item) => item.nomeProjeto === draft.nomeProjeto);

      if (indexExistente >= 0) {
        draftsAtuais[indexExistente] = draft;
      } else {
        draftsAtuais.push(draft);
      }

      window.localStorage.setItem(LOCAL_DRAFTS_KEY, JSON.stringify(draftsAtuais));
      setSalvos(draftsAtuais.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt)));

      setStatusMensagem(`✅ Projeto "${vistoria.nomeProjeto}" salvo com sucesso!`);

      setTimeout(() => {
        setVistoria({
          ...initialVistoriaState,
          id: crypto.randomUUID?.() ?? `${Date.now()}`,
        });
      }, 1500);
    } catch (erro) {
      console.error('Erro ao salvar no Firebase:', erro);
      setStatusMensagem('❌ Erro ao salvar. Verifique a conexão com o servidor.');
    } finally {
      setAGuardar(false);
    }
  };

  const handleProcessoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.length > 22) valor = valor.substring(0, 22);

    setVistoria((prev) => ({ ...prev, processoSei: valor }));

    if (valor.length >= 5) {
      const partes = valor.split('.');
      const orgao = partes[0];
      const secretaria = partes[1];

      if (!orgaosValidos[orgao]) {
        setMsgProcesso({ text: `❌ Órgão inválido`, color: '#d9534f' });
      } else if (!secretariasValidas[secretaria]) {
        setMsgProcesso({ text: `❌ Secretaria desconhecida`, color: '#d9534f' });
      } else {
        const nomeSec = secretariasValidas[secretaria];
        setMsgProcesso({ text: `✅ ${nomeSec}`, color: '#009639' });
      }
    } else {
      setMsgProcesso({ text: '', color: '' });
    }
  };

  const carregarProjetoSalvo = (projeto: SavedProjeto) => {
    setVistoria(projeto);
    setMostrarListaProjetos(false);
    setStatusMensagem(`Projeto "${projeto.nomeProjeto}" carregado com sucesso!`);
  };

  const adicionarAmbiente = () => {
    const novoAmbiente = {
      id: crypto.randomUUID?.() ?? `${Date.now()}`,
      nome: `Ambiente ${(vistoria.ambientes?.length ?? 0) + 1}`,
      fotos: [],
    };

    setVistoria((prev) => ({
      ...prev,
      ambientes: [...(prev.ambientes || []), novoAmbiente],
    }));
  };

  const handleAdicionarFotos = async (ambienteId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const arquivos = Array.from(e.target.files || []);
      const novasFotos = await Promise.all(
        arquivos.map(async (arquivo) => {
          const dataUrl = await getFileDataUrl(arquivo);
          return {
            id: crypto.randomUUID?.() ?? `${Date.now()}`,
            url: dataUrl,
            dataUrl: dataUrl,
            descricao: '',
          };
        })
      );

      setVistoria((prev) => ({
        ...prev,
        ambientes: prev.ambientes?.map((amb) =>
          amb.id === ambienteId ? { ...amb, fotos: [...(amb.fotos || []), ...novasFotos] } : amb
        ) || [],
      }));
    } catch (erro) {
      console.error(erro);
      setStatusMensagem('❌ Erro ao adicionar fotos');
    }
  };

  const getFileDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const grupos = agruparPorData(salvos);

  return (
    <div className="nova-vistoria-container">
      {/* BANNER */}
      <div className="banner">
        <h1>📋 Sistema de Registros Fotográficos - CVPIM</h1>
        <p>Crie e gerencie seus projetos de vistoria com facilidade</p>
      </div>

      <div className="container-main">
        {/* SEÇÃO: PROJETOS SALVOS */}
        <section className="projetos-salvos-section">
          <div className="section-header">
            <h2>📁 Seus Projetos Salvos</h2>
            <button className="btn-novo-projeto" onClick={() => setVistoria({ ...initialVistoriaState, id: crypto.randomUUID?.() ?? `${Date.now()}` })}>
              ➕ Novo Projeto
            </button>
          </div>

          <div className="projetos-grid" id="projectsGrid">
            {salvos.map((projeto) => (
              <div key={projeto.id} className="projeto-card">
                <div className="projeto-card-imagem">
                  {projeto.ambientes?.[0]?.fotos?.[0]?.dataUrl ? (
                    <img src={projeto.ambientes[0].fotos[0].dataUrl} alt={projeto.nomeProjeto} />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                <div className="projeto-card-titulo">{projeto.nomeProjeto}</div>
                <div className="projeto-card-meta">
                  <span>{formatarData(projeto.modifiedAt)}</span>
                  <span className="projeto-ambientes-count">{projeto.ambientes?.length || 0} ambiente(s)</span>
                </div>
                <div className="projeto-card-acoes">
                  <button className="btn-abrir" onClick={() => carregarProjetoSalvo(projeto)}>
                    Abrir
                  </button>
                  <button
                    className="btn-deletar"
                    onClick={() => {
                      if (confirm('Deletar este projeto?')) {
                        setSalvos((prev) => prev.filter((p) => p.id !== projeto.id));
                        window.localStorage.setItem(LOCAL_DRAFTS_KEY, JSON.stringify(salvos.filter((p) => p.id !== projeto.id)));
                      }
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {salvos.length === 0 && (
            <div className="empty-state">
              <p>📭 Nenhum projeto salvo ainda</p>
              <p className="text-muted">Crie seu primeiro projeto para começar</p>
            </div>
          )}
        </section>

        {/* SEÇÃO: EDITOR DE PROJETO */}
        {vistoria.nomeProjeto !== '' || vistoria.ambientes?.length ? (
          <section className="editor-section">
            <div className="editor-header">
              <input
                type="text"
                className="project-name-input"
                placeholder="Nome do Projeto"
                maxLength={50}
                value={vistoria.nomeProjeto || ''}
                onChange={(e) => setVistoria({ ...vistoria, nomeProjeto: e.target.value })}
              />
              <div className="editor-acoes">
                <button className="btn-salvar" onClick={handleGuardar} disabled={aGuardar}>
                  {aGuardar ? '⏳ Salvando...' : '💾 Salvar Projeto'}
                </button>
                <button className="btn-cancelar" onClick={() => setVistoria({ ...initialVistoriaState, id: crypto.randomUUID?.() ?? `${Date.now()}` })}>
                  ✕ Novo
                </button>
              </div>
            </div>

            {statusMensagem && <div className="status-message">{statusMensagem}</div>}

            {/* VALIDAÇÕES */}
            <div className="validacoes-panel">
              <h3>✓ Validações</h3>
              <div className="validacao-item">
                <label>
                  <input type="text" placeholder="Processo SEI (ex: 01.0000.0000.0000.0000000)" value={vistoria.processoSei || ''} onChange={handleProcessoChange} />
                  {msgProcesso.text && <span style={{ color: msgProcesso.color }}>{msgProcesso.text}</span>}
                </label>
              </div>
              <div className="validacao-item">
                <label>
                  Secretaria:
                  <select value={vistoria.secretaria || ''} onChange={(e) => setVistoria({ ...vistoria, secretaria: e.target.value })}>
                    {listaSecretariasDropdown.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="validacao-item">
                <label>
                  Endereço:
                  <input type="text" placeholder="Endereço do imóvel" value={vistoria.endereco || ''} onChange={(e) => setVistoria({ ...vistoria, endereco: e.target.value })} />
                </label>
              </div>
            </div>

            {/* AMBIENTES */}
            <div className="ambientes-section">
              <div className="ambientes-header">
                <h3>🏠 Ambientes do Projeto</h3>
                <button className="btn-adicionar-ambiente" onClick={adicionarAmbiente}>
                  ➕ Adicionar Ambiente
                </button>
              </div>

              <div className="ambientes-lista">
                {(vistoria.ambientes || []).map((ambiente) => (
                  <div key={ambiente.id} className="ambiente-card">
                    <div className="ambiente-card-fotos">
                      {ambiente.fotos && ambiente.fotos.length > 0 ? (
                        <img src={ambiente.fotos[0].dataUrl || ambiente.fotos[0].url} alt={ambiente.nome} />
                      ) : (
                        <span>📸 Nenhuma foto</span>
                      )}
                    </div>
                    <div className="ambiente-card-info">
                      <h4>{ambiente.nome}</h4>
                      <p className="ambiente-fotos-count">📸 {ambiente.fotos?.length || 0} foto(s)</p>
                      <label className="ambiente-upload">
                        Adicionar Fotos
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleAdicionarFotos(ambiente.id, e)}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* MODAL: PROJETOS SALVOS */}
        {mostrarListaProjetos && (
          <div className="modal-overlay" onClick={() => setMostrarListaProjetos(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Projetos Salvos</h2>
                <button className="btn-fechar-modal" onClick={() => setMostrarListaProjetos(false)}>
                  ✕
                </button>
              </div>

              <div className="modal-body">
                {Object.entries(grupos).map(([data, projetos]) => (
                  <div key={data} className="grupo-data">
                    <h4>{data}</h4>
                    <ul>
                      {projetos.map((proj) => (
                        <li key={proj.id}>
                          <div>
                            <strong>{proj.nomeProjeto}</strong>
                            <span className="hora">{new Date(proj.modifiedAt).toLocaleTimeString('pt-BR')}</span>
                          </div>
                          <div className="projeto-acoes">
                            <button className="btn-carregar" onClick={() => carregarProjetoSalvo(proj)}>
                              Carregar
                            </button>
                            <button
                              className="btn-excluir"
                              onClick={() => {
                                setSalvos((prev) => prev.filter((p) => p.id !== proj.id));
                              }}
                            >
                              Excluir
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}