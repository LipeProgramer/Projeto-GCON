import { useEffect, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import type { Vistoria, Ambiente } from '../types/vistoria';
import { salvarVistoriaNoFirebase } from '../services/vistoriaService';
import { RelatorioPDF } from '../components/RelatorioPDF';
import logoBranco from '../assets/logo_white.png';

const LOCAL_DRAFTS_KEY = 'registro-gcon-drafts';

interface SavedProjeto extends Vistoria {
  id: string;
  modifiedAt: string;
}

const orgaosValidos: Record<string, string> = {
  "01": "PMM - Prefeitura Municipal de Maringá",
  "03": "MGAPREV - Maringá Previdência",
  "16": "IAM - Instituto Ambiental de Maringá",
};

const secretariasValidas: Record<string, string> = {
  "02": "GAPRE", "03": "PROGE", "04": "SEGOV", "05": "SELOG",
  "06": "SEFAZ", "07": "SEURBH", "08": "SAUDE", "09": "SEDUC",
  "10": "SEBEA", "11": "SEMOB", "12": "SAET", "13": "SAS",
  "14": "SEMUC", "15": "SESP", "16": "SEMULHER", "17": "COMPLIANCE",
  "19": "SEINFRA", "20": "SEMOP", "22": "SEGEP", "26": "SSM",
  "27": "SELURB", "28": "AMETRO", "29": "SETRAB", "31": "SEJUC",
  "33": "SECOM", "34": "SECRIANCA", "35": "AMETECH", "36": "SEPED",
  "99": "Comissões e Conselhos",
};

const listaSecretariasDropdown = Object.values(secretariasValidas);

const initialVistoriaState: Partial<Vistoria> = {
  nomeProjeto: '',
  processoSei: '',
  endereco: '',
  secretaria: listaSecretariasDropdown[3], // Padrão SELOG
  dataVistoria: '',
  observacoes: '',
  ambientes: [],
};

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function obterDraftSerializado(vistoriaState: Partial<Vistoria>) {
  return {
    id: crypto.randomUUID(),
    nomeProjeto: vistoriaState.nomeProjeto || 'Projeto sem nome',
    processoSei: vistoriaState.processoSei || '',
    endereco: vistoriaState.endereco || '',
    secretaria: vistoriaState.secretaria || listaSecretariasDropdown[3],
    dataVistoria: vistoriaState.dataVistoria || '',
    observacoes: vistoriaState.observacoes || '',
    ambientes: (vistoriaState.ambientes || []).map((ambiente) => ({
      id: ambiente.id,
      nome: ambiente.nome,
      fotos: (ambiente.fotos || []).map((foto) => ({
        id: foto.id,
        url: foto.dataUrl || foto.url || '',
        dataUrl: foto.dataUrl || foto.url || '',
        descricao: foto.descricao || '',
      })),
    })),
    modifiedAt: new Date().toISOString(),
  } as SavedProjeto;
}

const carregarDraftsDoStorage = (): SavedProjeto[] => {
  if (typeof window === 'undefined') return [];
  const dados = window.localStorage.getItem(LOCAL_DRAFTS_KEY);
  if (!dados) return [];
  try {
    return JSON.parse(dados) as SavedProjeto[];
  } catch {
    return [];
  }
};

export function NovaVistoria() {
  const [vistoria, setVistoria] = useState<Partial<Vistoria>>(initialVistoriaState);
  const [salvos, setSalvos] = useState<SavedProjeto[]>([]);
  const [statusMensagem, setStatusMensagem] = useState('');
  const [aGuardar, setAGuardar] = useState(false);
  const [msgProcesso, setMsgProcesso] = useState({ text: '', color: '' });
  const [mostrarListaProjetos, setMostrarListaProjetos] = useState(false);

  useEffect(() => {
    setSalvos(carregarDraftsDoStorage().sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt)));
  }, []);

  useEffect(() => {
    if (!vistoria.nomeProjeto?.trim()) return;

    const timer = window.setTimeout(() => {
      const draft = obterDraftSerializado(vistoria);
      const atualizados = [draft, ...salvos.filter(item => item.id !== draft.id)];
      window.localStorage.setItem(LOCAL_DRAFTS_KEY, JSON.stringify(atualizados));
      setSalvos(atualizados.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt)));
      setStatusMensagem('Rascunho salvo automaticamente.');
    }, 700);

    return () => window.clearTimeout(timer);
  }, [vistoria]);

  const salvarRascunhoLocal = () => {
    const drafts = carregarDraftsDoStorage();

    const projeto: SavedProjeto = {
      ...(vistoria as SavedProjeto),
      id: (vistoria as any).id || crypto.randomUUID?.() || `${Date.now()}`,
      modifiedAt: new Date().toISOString(),
    } as SavedProjeto;

    const index = drafts.findIndex(item => item.id === projeto.id);
    if (index >= 0) {
      drafts[index] = projeto;
    } else {
      drafts.push(projeto);
    }

    window.localStorage.setItem(LOCAL_DRAFTS_KEY, JSON.stringify(drafts));
    setSalvos(drafts);
    setStatusMensagem('Projeto salvo com sucesso.');
  };

  const carregarProjetoSalvo = (projeto: SavedProjeto) => {
    setVistoria({
      nomeProjeto: projeto.nomeProjeto,
      processoSei: projeto.processoSei,
      endereco: projeto.endereco,
      secretaria: projeto.secretaria,
      dataVistoria: projeto.dataVistoria,
      observacoes: projeto.observacoes,
      ambientes: projeto.ambientes,
    });
    setMostrarListaProjetos(false);
    setStatusMensagem(`Projeto "${projeto.nomeProjeto}" carregado.`);
  };

  const excluirProjetoSalvo = (id: string) => {
    const atualizados = salvos.filter(item => item.id !== id);
    window.localStorage.setItem(LOCAL_DRAFTS_KEY, JSON.stringify(atualizados));
    setSalvos(atualizados);
    setStatusMensagem('Projeto excluído da lista de rascunhos.');
  };

  const agruparPorData = (itens: SavedProjeto[]) => {
    return itens.reduce<Record<string, SavedProjeto[]>>((acc, projeto) => {
      const data = formatarData(projeto.modifiedAt);
      if (!acc[data]) acc[data] = [];
      acc[data].push(projeto);
      return acc;
    }, {});
  };

  const getFileDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleProcessoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, "");

    if (valor.length > 2) valor = valor.replace(/^(\d{2})(\d)/, "$1.$2");
    if (valor.length > 4) valor = valor.replace(/^(\d{2})\.(\d{2})(\d)/, "$1.$2.$3");
    if (valor.length > 12) valor = valor.replace(/^(\d{2})\.(\d{2})\.(\d{8})(\d)/, "$1.$2.$3/$4");
    if (valor.length > 16) valor = valor.replace(/^(\d{2})\.(\d{2})\.(\d{8})\/(\d{4})(\d)/, "$1.$2.$3/$4.$5");
    if (valor.length > 22) valor = valor.substring(0, 22);

    const valorFormatado = valor
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{2})(\d)/, "$1.$2.$3")
      .replace(/^(\d{2})\.(\d{2})\.(\d{8})(\d)/, "$1.$2.$3/$4")
      .replace(/^(\d{2})\.(\d{2})\.(\d{8})\/(\d{4})(\d)/, "$1.$2.$3/$4.$5");

    setVistoria(prev => ({ ...prev, processoSei: valorFormatado }));

    if (valorFormatado.length >= 5) {
      const partes = valorFormatado.split(".");
      const orgao = partes[0];
      const secretaria = partes[1];
      const resto = valorFormatado.split("/")[1] ?? "";
      const ano = resto.length >= 4 ? Number(resto.slice(0, 4)) : null;

      if (!orgaosValidos[orgao]) {
        setMsgProcesso({ text: `❌ Órgão inválido`, color: "#d9534f" });
      } else if (!secretariasValidas[secretaria]) {
        setMsgProcesso({ text: `❌ Secretaria desconhecida`, color: "#d9534f" });
      } else if (ano !== null && ano < 2020) {
        setMsgProcesso({ text: `❌ Ano deve ser 2020 ou posterior`, color: "#d9534f" });
      } else {
        const nomeSec = secretariasValidas[secretaria];
        setMsgProcesso({ text: `✅ ${nomeSec}`, color: "#009639" });
      }
    } else {
      setMsgProcesso({ text: "", color: "" });
    }
  };

  const adicionarAmbiente = () => {
    const nome = prompt("Nome do ambiente (Ex: Fachada, Sala):");
    if (nome) {
      const novoAmbiente: Ambiente = { id: crypto.randomUUID(), nome, fotos: [] };
      setVistoria(prev => ({ ...prev, ambientes: [...(prev.ambientes || []), novoAmbiente] }));
    }
  };

  const handleAdicionarFotos = async (ambienteId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const arquivos = Array.from(e.target.files);
    const novasFotos = await Promise.all(arquivos.map(async (arquivo) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(arquivo),
      dataUrl: await getFileDataUrl(arquivo),
      file: arquivo,
    })));

    setVistoria(prev => ({
      ...prev,
      ambientes: prev.ambientes?.map(amb => 
        amb.id === ambienteId ? { ...amb, fotos: [...amb.fotos, ...novasFotos] } : amb
      )
    }));
  };

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
      await salvarVistoriaNoFirebase(vistoria);
      alert(`Projeto "${vistoria.nomeProjeto}" salvo com sucesso!`);
    } catch (erro) {
      console.error(erro);
      alert("Erro ao salvar.");
    } finally {
      setAGuardar(false);
    }
  };

  return (
    <div>
      <div className="banner-header">
        <img src={logoBranco} alt="Logo CVPIM" />
        <div className="banner-title">
          <h1>REGISTRO FOTOGRÁFICO</h1>
          <div className="sub">CVPIM – Comissão de Vistoria do Patrimônio Imobiliário</div>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <h2>Identificação</h2>
          
          <div className="grid3">
            <div className="field">
              <label>Processo</label>
              <input 
                type="text" 
                placeholder="Ex.: 00.00.00000000/0000.00"
                value={vistoria.processoSei}
                onChange={handleProcessoChange}
              />
              {msgProcesso.text && <span style={{ color: msgProcesso.color, fontSize: '11px', marginTop: '2px' }}>{msgProcesso.text}</span>}
            </div>

            <div className="field">
              <label>Imóvel</label>
              <input 
                type="text" 
                placeholder="Ex.: Cadastro / Endereço"
                value={vistoria.endereco}
                onChange={e => setVistoria({...vistoria, endereco: e.target.value})}
              />
            </div>

            <div className="field">
              <label>Secretaria</label>
              <select 
                value={vistoria.secretaria}
                onChange={e => setVistoria({...vistoria, secretaria: e.target.value})}
              >
                {listaSecretariasDropdown.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid2">
            <div className="field">
              <label>Data da vistoria</label>
              <input
                type="date"
                value={vistoria.dataVistoria?.toString() ?? ''}
                onChange={e => setVistoria({ ...vistoria, dataVistoria: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Observações</label>
              <textarea
                rows={2}
                placeholder="Anotações importantes"
                value={vistoria.observacoes ?? ''}
                onChange={e => setVistoria({ ...vistoria, observacoes: e.target.value })}
              />
            </div>
          </div>

          <div className="toolbar">
            <input 
              type="text" 
              placeholder="Nome do projeto (obrigatório p/ salvar)" 
              style={{ flex: 1, minWidth: '260px' }}
              value={vistoria.nomeProjeto}
              onChange={e => setVistoria({...vistoria, nomeProjeto: e.target.value})}
            />
            <button type="button" className="btn-secondary" onClick={() => setMostrarListaProjetos(true)}>Carregar Projeto</button>
            <button type="button" className="btn-secondary" onClick={salvarRascunhoLocal}>Salvar Rascunho</button>
            <button type="button" className="btn-ok" onClick={adicionarAmbiente}>Adicionar Ambiente</button>
            <button type="button" className="btn-secondary" onClick={handleGuardar} disabled={aGuardar}>
              {aGuardar ? 'Salvando...' : 'Salvar Projeto'}
            </button>
            {vistoria.nomeProjeto && vistoria.ambientes?.length ? (
              <PDFDownloadLink
                document={<RelatorioPDF vistoria={vistoria} />}
                fileName={`${vistoria.nomeProjeto.replace(/\s+/g, '_') || 'vistoria'}.pdf`}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: 'var(--azul)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                }}
              >
                {({ loading }) => (loading ? 'Gerando PDF...' : 'Gerar PDF')}
              </PDFDownloadLink>
            ) : (
              <button
                type="button"
                className="btn-primary"
                style={{ background: 'var(--azul)' }}
                disabled
              >
                Gerar PDF
              </button>
            )}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
            Os projetos serão salvos no banco de dados na nuvem (Firebase).
          </div>
        </div>

        {/* ÁREA DOS AMBIENTES */}
        {statusMensagem && (
          <div className="card" style={{ borderLeft: '4px solid var(--verde)' }}>
            <span>{statusMensagem}</span>
          </div>
        )}

        {mostrarListaProjetos && (
          <div className="modal-overlay" onClick={() => setMostrarListaProjetos(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Projetos Salvos</h3>
              {Object.entries(agruparPorData(salvos)).map(([data, projetos]) => (
                <div key={data}>
                  <h4>{data}</h4>
                  <ul>
                    {projetos.map((proj) => (
                      <li key={proj.id}>
                        <strong>{proj.nomeProjeto}</strong> - {new Date(proj.modifiedAt).toLocaleTimeString('pt-BR')}
                        <button onClick={() => carregarProjetoSalvo(proj)}>Carregar</button>
                        <button onClick={() => excluirProjetoSalvo(proj.id)}>Excluir</button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <button onClick={() => setMostrarListaProjetos(false)}>Fechar</button>
            </div>
          </div>
        )}

        {vistoria.ambientes?.map((ambiente) => (
          <div key={ambiente.id} className="card" style={{ borderLeft: '6px solid var(--verde)', padding: '18px', marginTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--azul)' }}>{ambiente.nome}</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <label className="btn-secondary" style={{ cursor: 'pointer', padding: '10px 14px' }}>
                  📸 Anexar Fotos
                  <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={(e) => handleAdicionarFotos(ambiente.id, e)} />
                </label>
                <button type="button" className="btn-secondary" onClick={() => setVistoria(prev => ({
                  ...prev,
                  ambientes: prev.ambientes?.filter(item => item.id !== ambiente.id) || []
                }))}>
                  Remover ambiente
                </button>
              </div>
            </div>

            {ambiente.fotos.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                {ambiente.fotos.map(foto => (
                  <div key={foto.id} style={{ position: 'relative', width: '120px', height: '90px' }}>
                    <img src={foto.url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc' }} />
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ position: 'absolute', top: 6, right: 6, padding: '4px 8px', fontSize: '11px' }}
                      onClick={() => setVistoria(prev => ({
                        ...prev,
                        ambientes: prev.ambientes?.map(item => item.id === ambiente.id ? {
                          ...item,
                          fotos: item.fotos.filter(f => f.id !== foto.id)
                        } : item) || []
                      }))}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginTop: '12px', color: 'var(--muted)', fontSize: '13px' }}>Nenhuma foto anexada ainda.</div>
            )}
          </div>
        ))}

      </div>
    </div>
  );
}