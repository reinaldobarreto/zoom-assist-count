$(document).ready(function () {
  var dataTable = $("#dataTable").DataTable({
    ajax: "js/datatablePT-BR.json",
    columnDefs: [
      {
        targets: -1,
        data: null,
        defaultContent:
          "<button type='button' class='btn btn-primary viewButton'>Visualizar</button> <button type='button' class='btn btn-danger deleteButton'>Deletar</button>",
      },
    ],
    language: {
      url: "https://cdn.datatables.net/plug-ins/1.13.2/i18n/pt-BR.json",
    },
  });

  $("#importButton").click(function () {
    var file = $("#inputFile").prop("files")[0];

    if (!file) {
      alert("Selecione um arquivo CSV primeiro");
      return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      var contents = e.target.result;
      var lines = contents.split("\n");

      for (var i = 7; i < lines.length; i++) {
        var cells = lines[i].split(",");
        if (cells.length >= 6) {
          dataTable.row
            .add([cells[0], cells[1], cells[2], cells[3], cells[4], cells[5]])
            .draw();
        }
      }
    };
    reader.readAsText(file);
  });

  $("#dataTable tbody").on("click", ".viewButton", function () {
    var data = dataTable.row($(this).parents("tr")).data();

    $("#modalId").text(data[0]);
    $("#modalName").text(data[1]);
    $("#modalEmail").text(data[2]);
    $("#modalDatetime").text(data[3]);
    $("#modalHora").text(data[4]);
    $("#modalVote").text(data[5]);
    $("#dataModal").modal("show");
  });
  $("#dataTable tbody").on("click", ".deleteButton", function () {
    dataTable.row($(this).parents("tr")).remove().draw();

    var voteValue = parseInt(
      $(this)
        .closest("tr")
        .find("td:eq(5)")
        .text()
        .replace(/[^0-9]/g, "")
    );

    var voteSum = parseInt(
      $("#voteSum")
        .text()
        .replace(/[^0-9]/g, "")
    );

    $("#voteSum").text(voteSum - voteValue);
  });

  var dataTable = $("#dataTable").DataTable();
  var filteredData = [];
  var originalData = [];

  $("#filterDuplicates").click(function () {
    if (!filteredData.length) {
      originalData = dataTable.rows().data().toArray();

      var checkedNumbers = [];
      for (var i = 0; i < originalData.length; i++) {
        var number = originalData[i][1];

        if (!checkedNumbers.includes(number)) {
          checkedNumbers.push(number);
        } else {
          filteredData.push(originalData[i]);
        }
      }

      dataTable.clear();
      dataTable.rows.add(filteredData);
      dataTable.draw();
    }
  });

  $("#undoFilter").click(function () {
    if (filteredData.length) {
      dataTable.clear();
      dataTable.rows.add(originalData);
      dataTable.draw();

      filteredData = [];
      originalData = [];
    }
  });

  var originalData;

  $("#undoFilterDuplicates").click(function () {
    var dataTable = $("#dataTable").DataTable();
    if (!originalData) {
      originalData = dataTable.rows().data();
      var data = dataTable.rows().data();
      dataTable.rows.add(filteredData);
      dataTable.clear();
      dataTable.rows.add(originalData);
      dataTable.draw();
      originalData = null;
    }
  });

  $("#resetSum").click(function () {
    $("#voteSum").text("0");
  });

  var table = $("#dataTable").DataTable();

  $("#sumVotes").click(function () {
    var sum = 0;
    table.rows().every(function (rowIdx, tableLoop, rowLoop) {
      var data = this.data();
      var voting = data[5].replace(/\D/g, "");
      sum += parseInt(voting);
    });
    $("#voteSum").text(sum);
  });

  $("#clearHistory").click(function () {
    $("#dataTable").DataTable().clear();
    location.reload();
  });

  var currentDeleteStep = 0;
  var intro;
  var deleting = false;

  function startTutorial() {
    intro = introJs().setOptions({
      nextLabel: "Próximo",
      prevLabel: "Anterior",
      skipLabel: "Pular",
      doneLabel: "Concluir",
      showProgress: true,
      showBullets: false,
      steps: [
        {
          intro: "Bem-vindo ao Tutorial! Vamos guiá-lo através do processo.",
        },
        {
          element: "#inputFile",
          intro: "Primeiro, clique no botão 'Browser' e selecione um arquivo CSV para importar.",
        },
        {
          element: "#importButton",
          intro: "Agora clique no botão 'Importar' para adicionar os dados do arquivo CSV.",
        },
        {
          element: "#sumVotes",
          intro: "Após importar, clique em 'Somar Votações' para calcular o total da assistência.",
        },
        {
          element: "#filterDuplicates",
          intro: "Clique no botão 'Filtrar Repetidos' para listar os registros repetidos.",
        },
        {
          element: ".deleteButton",
          intro: "Aqui estão os registros repetidos. Clique no botão 'Deletar' para removê-los um por um.",
        },
        {
          element: "#voteSum",
          intro: "Aqui você pode ver o novo total de assistência após remover os registros repetidos.",
        },
        {
          element: "#undoFilterDuplicates",
          intro: "Clique no botão 'Desfazer Filtro' para restaurar todos os dados da tabela.",
        },
        {
          element: "#undoFilter",
          intro: "Clique no botão 'Desfazer Filtro de Repetidos' para restaurar todos os dados da tabela.",
          position: "bottom", // Define a posição do popup
        },
        {
          element: "#resetSum",
          intro: "Clique no botão 'Zerar Votação' para redefinir o valor total das votações.",
        },
        {
          element: "#sumVotes",
          intro: "Clique novamente em 'Somar Votações' para calcular o valor total inicial após importar e somar repetidos.",
        },
        {
          intro: "Tutorial concluído! Sinta-se à vontade para explorar as outras funcionalidades.",
        },
      ],
    });

   
    var $filterButton = $("#filterDuplicates");
    var $deleteButtons = $("#dataTable .deleteButton");
    var $undoFilterButton = $("#undoFilter");
    var filterStepIndex = 4;

    intro.onexit(function () {
      currentDeleteStep = 0;
      deleting = false;
    });

    function deleteNextRow() {
      if (currentDeleteStep < $deleteButtons.length) {
        var $row = $deleteButtons.eq(currentDeleteStep).closest("tr");
        var voteValue = parseInt($row.find("td:eq(5)").text().replace(/[^0-9]/g, ""));
        var voteSum = parseInt($("#voteSum").text().replace(/[^0-9]/g, ""));
        $("#voteSum").text(voteSum - voteValue);

        dataTable.row($row).remove().draw();

        currentDeleteStep++;
        if (currentDeleteStep < $deleteButtons.length) {
          intro.goToStep($deleteButtons.eq(currentDeleteStep)).oncomplete(function () {
            deleting = false; // Allow next deletion
          }).start();
        } else {
          intro.goToStep($filterButton).start();
        }
      } else {
        intro.goToStep($filterButton).start();
      }
    }

    $deleteButtons.each(function (index) {
      var $this = $(this);
      $this.click(function () {
        if (!deleting) {
          deleting = true;
          if (currentDeleteStep === 0) {
            introJs().goToStep(filterStepIndex).start();
          }
          deleteNextRow();
        }
      });
    });

    $filterButton.click(function () {
      var $repeatedRows = $("#dataTable tr.duplicate-row");

      if ($repeatedRows.length > 0) {
        intro.goToStep($deleteButtons.eq(0)).start();
      } else {
        intro.goToStep(filterStepIndex).nextStep().start();
      }
    });


    $undoFilterButton.click(function () {
      var dataTable = $("#dataTable").DataTable();
      if (filteredData.length) {
        dataTable.clear();
        dataTable.rows.add(originalData);
        dataTable.draw();
  
        filteredData = [];
        originalData = [];
  
        // Continuar para a próxima etapa do tutorial
        intro.goToStep(filterStepIndex + 1).start();
      }
    });

    
    intro.oncomplete(function () {
      $("#importButton").prop("disabled", false);
    });


    // Destaque o botão "Desfazer Filtro de Repetidos" ao entrar neste passo
    intro.onbeforechange(function(targetElement) {
      if (targetElement.id === "undoFilter") {
        $undoFilterButton.addClass("introjs-button-highlight"); // Adicione uma classe de destaque ao botão
      } else {
        $undoFilterButton.removeClass("introjs-button-highlight"); // Remova a classe de destaque se não for o botão alvo
      }
    });

    intro.onexit(function() {
      introJs().removeHints(); // Remova os destaques ao sair do tutorial
    });

    intro.start();
  }

  $("#startTutorial").click(startTutorial);
});
