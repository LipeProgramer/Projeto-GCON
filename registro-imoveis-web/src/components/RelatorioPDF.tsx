import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { Vistoria } from '../types/vistoria';

const logoBase64 = 'src/assets/logo_rodape.png'; // Substitua pelo caminho correto da sua imagem

// Estilos específicos para o PDF (parecido com CSS, mas próprio para impressão)
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  cabecalhoContainer: { marginBottom: 10, borderBottom: '1px solid #333', paddingBottom: 12 },
  logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: 10 },
  cabecalhoTexto: { fontSize: 11, textAlign: 'center', fontWeight: 'bold', lineHeight: 1.2 },
  cabecalhoEndereco: { fontSize: 10, textAlign: 'center', marginBottom: 2 },
  tituloPrincipal: { fontSize: 14, textAlign: 'center', fontWeight: 'bold', marginTop: 8, marginBottom: 18, textTransform: 'uppercase' },
  section: { marginBottom: 15 },
  label: { fontSize: 12, fontWeight: 'bold', marginBottom: 4, color: '#333' },
  value: { fontSize: 12, marginBottom: 8, lineHeight: 1.5 },
  divisor: { borderBottom: '1px solid #ccc', marginVertical: 15 },
  ambienteTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#0056b3' },
  fotosContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  fotoWrapper: { width: '48%', marginBottom: 10 },
  foto: { width: '100%', height: 150, objectFit: 'cover' },
  assinaturaContainer: { marginTop: 24 },
  assinaturaLinha: { fontSize: 11, lineHeight: 1.5, marginTop: 4 },
});

interface Props {
  vistoria: Partial<Vistoria>;
}

// Este é o "desenho" da folha A4
export function RelatorioPDF({ vistoria }: Props) {
  const ambientes = vistoria.ambientes ?? [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.cabecalhoContainer}>
          <Image src={logoBase64} style={styles.logo} />
          <Text style={styles.cabecalhoTexto}>PREFEITURA DO MUNICÍPIO DE MARINGÁ</Text>
          <Text style={styles.cabecalhoTexto}>Unidade Temporária</Text>
          <Text style={styles.cabecalhoTexto}>Comissão de Vistoria do Patrimônio Imobiliário</Text>
          <Text style={styles.cabecalhoEndereco}>Rua Néo Alves Martins, 2597 Bairro Centro, Maringá/PR</Text>
          <Text style={styles.cabecalhoEndereco}>CEP 87013-060, Telefone: (44) 3127-7004 - www.maringa.pr.gov.br</Text>
        </View>

        <Text style={styles.tituloPrincipal}>Relatório de Vistoria de Imóvel</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Título da Vistoria:</Text>
          <Text style={styles.value}>{vistoria.nomeProjeto}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Processo SEI:</Text>
          <Text style={styles.value}>{vistoria.processoSei}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Endereço:</Text>
          <Text style={styles.value}>{vistoria.endereco}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Secretaria:</Text>
          <Text style={styles.value}>{vistoria.secretaria}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Data da Vistoria:</Text>
          <Text style={styles.value}>
            {vistoria.dataVistoria ? new Date(vistoria.dataVistoria).toLocaleDateString('pt-BR') : ''}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Observações:</Text>
          <Text style={styles.value}>{vistoria.observacoes}</Text>
        </View>

        <View style={styles.divisor} />

        {ambientes.map((ambiente, index) => (
          <View key={ambiente.id} style={styles.section}>
            <Text style={styles.ambienteTitle}>Ambiente {index + 1}: {ambiente.nome}</Text>
            <View style={styles.fotosContainer}>
              {ambiente.fotos.map((foto) => (
                <View key={foto.id} style={styles.fotoWrapper}>
                  <Image src={foto.dataUrl || foto.url} style={styles.foto} />
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.assinaturaContainer}>
          <Text style={styles.label}>Assinaturas:</Text>
          <Text style={styles.assinaturaLinha}>João Barbosa Junior – Presidente</Text>
          <Text style={styles.assinaturaLinha}>Hevellen Cris Correa Puhina Guimarães – Membro</Text>
          <Text style={styles.assinaturaLinha}>Suzan Daiane Iore – Membro</Text>
          <Text style={styles.assinaturaLinha}>Thiago Gomes Mandarino – Membro</Text>
        </View>

      </Page>
    </Document>
  );
}